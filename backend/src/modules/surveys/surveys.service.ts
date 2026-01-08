import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey, SurveyVersion, Question, QuestionOption, SurveyTemplate } from './entities';
import {
  CreateSurveyDto,
  UpdateSurveyDto,
  CreateSurveyVersionDto,
  CreateQuestionDto,
  CreateSurveyTemplateDto,
  ApplySurveyTemplateDto,
} from './dto';
import { VisibilityCondition } from './types/visibility-condition.type';

@Injectable()
export class SurveysService {
  constructor(
    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,
    @InjectRepository(SurveyVersion)
    private surveyVersionRepository: Repository<SurveyVersion>,
    @InjectRepository(SurveyTemplate)
    private surveyTemplateRepository: Repository<SurveyTemplate>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(QuestionOption)
    private questionOptionRepository: Repository<QuestionOption>,
  ) {}

    private prepareQuestions(questions: CreateQuestionDto[]): CreateQuestionDto[] {
      const codes = new Set<string>();

      return questions.map((question, index) => {
        const code = (question.code || `q${index + 1}`).trim();

        if (codes.has(code)) {
          throw new BadRequestException(
            `Duplicate question code "${code}" found in survey version payload`,
          );
        }

        codes.add(code);

        return {
          ...question,
          code,
          orderIndex: question.orderIndex ?? index + 1,
          required: question.required ?? false,
        };
      });
    }

    private validateVisibilityRules(questions: CreateQuestionDto[]): void {
      const orderByCode = new Map<string, number>();

      questions.forEach((question) => {
        orderByCode.set(question.code, question.orderIndex ?? 0);
      });

      questions.forEach((question) => {
        if (!question.visibilityConditions || question.visibilityConditions.length === 0) {
          return;
        }

        for (const condition of question.visibilityConditions as VisibilityCondition[]) {
          if (!orderByCode.has(condition.questionCode)) {
            throw new BadRequestException(
              `Question ${question.code} references unknown question code ${condition.questionCode} in skip logic`,
            );
          }

          const referencedOrder = orderByCode.get(condition.questionCode) as number;
          if (referencedOrder >= (question.orderIndex ?? referencedOrder + 1)) {
            throw new BadRequestException(
              `Question ${question.code} can only depend on previous questions in skip logic`,
            );
          }
        }
      });
    }

  async create(createSurveyDto: CreateSurveyDto, userId: string): Promise<Survey> {
    const survey = this.surveyRepository.create({
      ...createSurveyDto,
      createdBy: { id: userId } as any,
    });

    const savedSurvey = await this.surveyRepository.save(survey);

    // Create initial version (v1) automatically
    const initialVersion = this.surveyVersionRepository.create({
      survey: savedSurvey,
      versionNumber: 1,
      questions: [],
    });

    await this.surveyVersionRepository.save(initialVersion);

    // Return survey with versions relation
    return this.surveyRepository.findOne({
      where: { id: savedSurvey.id },
      relations: ['versions'],
    });
  }

  private async persistQuestionsToVersion(
    questions: CreateQuestionDto[],
    version: SurveyVersion,
  ): Promise<void> {
    for (const questionDto of questions) {
      const question = this.questionRepository.create({
        ...questionDto,
        surveyVersion: version,
      });

      const savedQuestion = await this.questionRepository.save(question);

      if (questionDto.options && questionDto.options.length > 0) {
        const options = questionDto.options.map((optionDto) =>
          this.questionOptionRepository.create({
            ...optionDto,
            question: savedQuestion,
          }),
        );

        await this.questionOptionRepository.save(options);
      }
    }
  }

  async findAll(): Promise<Survey[]> {
    const surveys = await this.surveyRepository.find({
      relations: ['versions', 'createdBy'],
      order: { createdAt: 'DESC' },
    });

    // Add versionsCount to each survey
    return surveys.map(survey => ({
      ...survey,
      versionsCount: survey.versions?.length || 0,
    }));
  }

  async findOne(id: string): Promise<Survey> {
    const survey = await this.surveyRepository.findOne({
      where: { id },
      relations: ['versions', 'versions.questions', 'versions.questions.options'],
    });

    if (!survey) {
      throw new NotFoundException(`Survey with ID ${id} not found`);
    }

    return survey;
  }

  async update(id: string, updateSurveyDto: UpdateSurveyDto): Promise<Survey> {
    const survey = await this.findOne(id);
    Object.assign(survey, updateSurveyDto);
    return this.surveyRepository.save(survey);
  }

  async remove(id: string): Promise<void> {
    const survey = await this.findOne(id);
    await this.surveyRepository.remove(survey);
  }

  async createVersion(
    surveyId: string,
    createVersionDto: CreateSurveyVersionDto,
  ): Promise<SurveyVersion> {
    const survey = await this.findOne(surveyId);

    const { questions: incomingQuestions, ...rest } = createVersionDto;

    const normalizedQuestions = this.prepareQuestions(incomingQuestions);
    this.validateVisibilityRules(normalizedQuestions);

    const versionCount = await this.surveyVersionRepository.count({
      where: { survey: { id: surveyId } },
    });

    const version = this.surveyVersionRepository.create({
      ...rest,
      survey,
      versionNumber: versionCount + 1,
    });

    const savedVersion = await this.surveyVersionRepository.save(version);

    await this.persistQuestionsToVersion(normalizedQuestions, savedVersion);

    return this.surveyVersionRepository.findOne({
      where: { id: savedVersion.id },
      relations: ['questions', 'questions.options'],
    });
  }

  async findVersions(surveyId: string): Promise<SurveyVersion[]> {
    const survey = await this.surveyRepository.findOne({
      where: { id: surveyId },
    });

    if (!survey) {
      throw new NotFoundException(`Survey with ID ${surveyId} not found`);
    }

    return this.surveyVersionRepository.find({
      where: { survey: { id: surveyId } },
      relations: ['questions', 'questions.options'],
      order: { versionNumber: 'DESC' },
    });
  }

  async findVersion(surveyId: string, versionId: string): Promise<SurveyVersion> {
    const version = await this.surveyVersionRepository.findOne({
      where: { id: versionId, survey: { id: surveyId } },
      relations: ['questions', 'questions.options', 'survey'],
    });

    if (!version) {
      throw new NotFoundException(
        `Version with ID ${versionId} not found for survey ${surveyId}`,
      );
    }

    return version;
  }

  async createTemplate(
    createSurveyTemplateDto: CreateSurveyTemplateDto,
    userId: string,
  ): Promise<SurveyTemplate> {
    const normalizedQuestions = this.prepareQuestions(
      createSurveyTemplateDto.questions,
    );
    this.validateVisibilityRules(normalizedQuestions);

    const template = this.surveyTemplateRepository.create({
      name: createSurveyTemplateDto.name,
      description: createSurveyTemplateDto.description,
      questions: normalizedQuestions,
      createdBy: { id: userId } as any,
    });

    return this.surveyTemplateRepository.save(template);
  }

  async findTemplates(): Promise<SurveyTemplate[]> {
    return this.surveyTemplateRepository.find({
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findTemplate(id: string): Promise<SurveyTemplate> {
    const template = await this.surveyTemplateRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!template) {
      throw new NotFoundException(`Survey template with ID ${id} not found`);
    }

    return template;
  }

  async createSurveyFromTemplate(
    templateId: string,
    applySurveyTemplateDto: ApplySurveyTemplateDto,
    userId: string,
  ): Promise<Survey> {
    const template = await this.findTemplate(templateId);

    const normalizedQuestions = this.prepareQuestions(
      template.questions as CreateQuestionDto[],
    );
    this.validateVisibilityRules(normalizedQuestions);

    const survey = this.surveyRepository.create({
      title: applySurveyTemplateDto.title || template.name,
      description:
        applySurveyTemplateDto.description ?? template.description ?? null,
      createdBy: { id: userId } as any,
    });

    const savedSurvey = await this.surveyRepository.save(survey);

    const version = this.surveyVersionRepository.create({
      survey: savedSurvey,
      versionNumber: 1,
      changeLog:
        applySurveyTemplateDto.changeLog || 'Created from survey template',
      isActive: true,
    });

    const savedVersion = await this.surveyVersionRepository.save(version);

    await this.persistQuestionsToVersion(normalizedQuestions, savedVersion);

    return this.surveyRepository.findOne({
      where: { id: savedSurvey.id },
      relations: ['versions', 'versions.questions', 'versions.questions.options'],
    });
  }
}
