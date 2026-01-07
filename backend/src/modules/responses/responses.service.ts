import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response, ResponseItem } from './entities';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { Question } from '../surveys/entities/question.entity';
import { SubmitResponseDto } from './dto';
import { CampaignStatus, VisibilityOperator } from '@common/enums';
import { VisibilityCondition } from '../surveys/types/visibility-condition.type';

@Injectable()
export class ResponsesService {
  constructor(
    @InjectRepository(Response)
    private responseRepository: Repository<Response>,
    @InjectRepository(ResponseItem)
    private responseItemRepository: Repository<ResponseItem>,
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

    private isEmptyValue(value: any): boolean {
      if (value === null || value === undefined) {
        return true;
      }

      if (typeof value === 'string') {
        return value.trim().length === 0;
      }

      if (Array.isArray(value)) {
        return value.length === 0;
      }

      return false;
    }

    private evaluateCondition(
      condition: VisibilityCondition,
      answersByCode: Map<string, any>,
    ): boolean {
      const actual = answersByCode.get(condition.questionCode);

      switch (condition.operator) {
        case VisibilityOperator.EQUALS:
          return actual === condition.value;
        case VisibilityOperator.NOT_EQUALS:
          return actual !== condition.value;
        case VisibilityOperator.IN:
          return Array.isArray(condition.value)
            ? condition.value.includes(actual)
            : false;
        case VisibilityOperator.NOT_IN:
          return Array.isArray(condition.value)
            ? !condition.value.includes(actual)
            : true;
        case VisibilityOperator.GREATER_THAN:
          return actual > condition.value;
        case VisibilityOperator.GREATER_OR_EQUAL:
          return actual >= condition.value;
        case VisibilityOperator.LESS_THAN:
          return actual < condition.value;
        case VisibilityOperator.LESS_OR_EQUAL:
          return actual <= condition.value;
        case VisibilityOperator.CONTAINS:
          if (Array.isArray(actual)) {
            return actual.includes(condition.value);
          }

          if (typeof actual === 'string') {
            return actual.includes(String(condition.value ?? ''));
          }

          return false;
        case VisibilityOperator.NOT_CONTAINS:
          if (Array.isArray(actual)) {
            return !actual.includes(condition.value);
          }

          if (typeof actual === 'string') {
            return !actual.includes(String(condition.value ?? ''));
          }

          return true;
        case VisibilityOperator.IS_EMPTY:
          return this.isEmptyValue(actual);
        case VisibilityOperator.IS_NOT_EMPTY:
          return !this.isEmptyValue(actual);
        default:
          return true;
      }
    }

    private isQuestionVisible(
      question: Question,
      answersByCode: Map<string, any>,
    ): boolean {
      if (!question.visibilityConditions || question.visibilityConditions.length === 0) {
        return true;
      }

      return (question.visibilityConditions as VisibilityCondition[]).every((condition) =>
        this.evaluateCondition(condition, answersByCode),
      );
    }

  async submit(
    submitResponseDto: SubmitResponseDto,
    userId: string,
  ): Promise<Response> {
    if (!userId) {
      throw new UnauthorizedException('User authentication required to submit responses');
    }

    const campaign = await this.campaignRepository.findOne({
      where: { id: submitResponseDto.campaignId },
      relations: ['surveyVersion', 'surveyVersion.questions', 'surveyVersion.questions.options'],
    });

    if (!campaign) {
      throw new NotFoundException(
        `Campaign with ID ${submitResponseDto.campaignId} not found`,
      );
    }

    if (campaign.status !== CampaignStatus.PUBLISHED) {
      throw new BadRequestException('Campaign is not published');
    }

    const existingResponse = await this.responseRepository.findOne({
      where: {
        campaign: { id: submitResponseDto.campaignId },
        user: { id: userId },
      },
    });

    if (existingResponse) {
      throw new BadRequestException('You have already submitted a response for this campaign');
    }

    const now = new Date();
    if (now < campaign.startDate || now > campaign.endDate) {
      throw new BadRequestException('Campaign is not active');
    }

    const versionQuestions = campaign.surveyVersion?.questions || [];
    const questionById = new Map<string, Question>(
      versionQuestions.map((question) => [question.id, question]),
    );

    const answersByCode = new Map<string, any>();
    const answersById = new Map<string, any>();

    for (const itemDto of submitResponseDto.items) {
      const question = questionById.get(itemDto.questionId);

      if (!question) {
        throw new BadRequestException(
          `Question with ID ${itemDto.questionId} does not belong to this campaign's survey version`,
        );
      }

      answersById.set(itemDto.questionId, itemDto.value);
      const codeKey = question.code || question.id;
      answersByCode.set(codeKey, itemDto.value);
    }

    const orderedQuestions = [...versionQuestions].sort(
      (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
    );

    const visibilityByQuestionId = new Map<string, boolean>();

    for (const question of orderedQuestions) {
      const isVisible = this.isQuestionVisible(question, answersByCode);
      visibilityByQuestionId.set(question.id, isVisible);
    }

    for (const question of orderedQuestions) {
      const isVisible = visibilityByQuestionId.get(question.id);

      if (isVisible && question.required && !answersById.has(question.id)) {
        throw new BadRequestException(
          `Missing response for required question: ${question.text}`,
        );
      }
    }

    for (const itemDto of submitResponseDto.items) {
      const isVisible = visibilityByQuestionId.get(itemDto.questionId);

      if (isVisible === false) {
        throw new BadRequestException(
          `Response contains an answer for a question hidden by skip logic`,
        );
      }
    }

    const startedAt = new Date();
    const response = this.responseRepository.create({
      campaign,
      user: { id: userId } as any,
      anonymousId: submitResponseDto.anonymousId,
      startedAt,
      completedAt: new Date(),
    });

    const savedResponse = await this.responseRepository.save(response);

    for (const itemDto of submitResponseDto.items) {
      const question = questionById.get(itemDto.questionId) as Question;

      const responseItem = this.responseItemRepository.create({
        response: savedResponse,
        question,
        value: itemDto.value,
      });

      await this.responseItemRepository.save(responseItem);
    }

    // Calculate completion time
    const completedAt = new Date();
    const completionTimeSeconds = Math.floor(
      (completedAt.getTime() - startedAt.getTime()) / 1000,
    );

    savedResponse.completedAt = completedAt;
    savedResponse.completionTimeSeconds = completionTimeSeconds;

    return this.responseRepository.save(savedResponse);
  }

  async findAll(): Promise<Response[]> {
    return this.responseRepository.find({
      relations: ['campaign', 'user', 'items', 'items.question'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Response> {
    const response = await this.responseRepository.findOne({
      where: { id },
      relations: [
        'campaign',
        'campaign.surveyVersion',
        'user',
        'items',
        'items.question',
      ],
    });

    if (!response) {
      throw new NotFoundException(`Response with ID ${id} not found`);
    }

    return response;
  }

  async findByCampaign(campaignId: string): Promise<Response[]> {
    return this.responseRepository.find({
      where: { campaign: { id: campaignId } },
      relations: ['user', 'items', 'items.question'],
      order: { createdAt: 'DESC' },
    });
  }
}
