import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response, ResponseItem } from './entities';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { Question } from '../surveys/entities/question.entity';
import { SubmitResponseDto } from './dto';
import { CampaignStatus } from '@common/enums';

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

  async submit(
    submitResponseDto: SubmitResponseDto,
    userId?: string,
  ): Promise<Response> {
    const campaign = await this.campaignRepository.findOne({
      where: { id: submitResponseDto.campaignId },
      relations: ['surveyVersion', 'surveyVersion.questions'],
    });

    if (!campaign) {
      throw new NotFoundException(
        `Campaign with ID ${submitResponseDto.campaignId} not found`,
      );
    }

    if (campaign.status !== CampaignStatus.PUBLISHED) {
      throw new BadRequestException('Campaign is not published');
    }

    const now = new Date();
    if (now < campaign.startDate || now > campaign.endDate) {
      throw new BadRequestException('Campaign is not active');
    }

    const startedAt = new Date();
    const response = this.responseRepository.create({
      campaign,
      user: userId ? ({ id: userId } as any) : null,
      anonymousId: submitResponseDto.anonymousId,
      startedAt,
      completedAt: new Date(),
    });

    const savedResponse = await this.responseRepository.save(response);

    // Validate and save response items
    for (const itemDto of submitResponseDto.items) {
      const question = await this.questionRepository.findOne({
        where: { id: itemDto.questionId },
      });

      if (!question) {
        throw new NotFoundException(
          `Question with ID ${itemDto.questionId} not found`,
        );
      }

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
