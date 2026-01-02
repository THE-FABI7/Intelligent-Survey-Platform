import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey, SurveyVersion, Question, QuestionOption } from './entities';
import {
  CreateSurveyDto,
  UpdateSurveyDto,
  CreateSurveyVersionDto,
} from './dto';

@Injectable()
export class SurveysService {
  constructor(
    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,
    @InjectRepository(SurveyVersion)
    private surveyVersionRepository: Repository<SurveyVersion>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(QuestionOption)
    private questionOptionRepository: Repository<QuestionOption>,
  ) {}

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

    const versionCount = await this.surveyVersionRepository.count({
      where: { survey: { id: surveyId } },
    });

    const version = this.surveyVersionRepository.create({
      ...createVersionDto,
      survey,
      versionNumber: versionCount + 1,
    });

    const savedVersion = await this.surveyVersionRepository.save(version);

    // Create questions and options
    for (const questionDto of createVersionDto.questions) {
      const question = this.questionRepository.create({
        ...questionDto,
        surveyVersion: savedVersion,
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
}
