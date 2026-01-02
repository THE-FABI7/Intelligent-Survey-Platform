import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from './entities/campaign.entity';
import { SurveyVersion } from '../surveys/entities/survey-version.entity';
import { CreateCampaignDto, UpdateCampaignDto } from './dto';
import { CampaignStatus } from '@common/enums';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    @InjectRepository(SurveyVersion)
    private surveyVersionRepository: Repository<SurveyVersion>,
  ) {}

  async create(
    createCampaignDto: CreateCampaignDto,
    userId: string,
  ): Promise<Campaign> {
    const surveyVersion = await this.surveyVersionRepository.findOne({
      where: { id: createCampaignDto.surveyVersionId },
      relations: ['survey'],
    });

    if (!surveyVersion) {
      throw new NotFoundException(
        `Survey version with ID ${createCampaignDto.surveyVersionId} not found`,
      );
    }

    const campaign = this.campaignRepository.create({
      name: createCampaignDto.name,
      description: createCampaignDto.description,
      startDate: new Date(createCampaignDto.startDate),
      endDate: new Date(createCampaignDto.endDate),
      surveyVersion,
      createdBy: { id: userId } as any,
    });

    return this.campaignRepository.save(campaign);
  }

  async findAll(): Promise<Campaign[]> {
    return this.campaignRepository.find({
      relations: ['surveyVersion', 'surveyVersion.survey'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
      relations: [
        'surveyVersion',
        'surveyVersion.survey',
        'surveyVersion.questions',
        'surveyVersion.questions.options',
      ],
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return campaign;
  }

  async update(
    id: string,
    updateCampaignDto: UpdateCampaignDto,
  ): Promise<Campaign> {
    const campaign = await this.findOne(id);

    if (updateCampaignDto.surveyVersionId) {
      const surveyVersion = await this.surveyVersionRepository.findOne({
        where: { id: updateCampaignDto.surveyVersionId },
      });

      if (!surveyVersion) {
        throw new NotFoundException(
          `Survey version with ID ${updateCampaignDto.surveyVersionId} not found`,
        );
      }

      campaign.surveyVersion = surveyVersion;
    }

    Object.assign(campaign, {
      name: updateCampaignDto.name ?? campaign.name,
      description: updateCampaignDto.description ?? campaign.description,
      startDate: updateCampaignDto.startDate
        ? new Date(updateCampaignDto.startDate)
        : campaign.startDate,
      endDate: updateCampaignDto.endDate
        ? new Date(updateCampaignDto.endDate)
        : campaign.endDate,
    });

    return this.campaignRepository.save(campaign);
  }

  async remove(id: string): Promise<void> {
    const campaign = await this.findOne(id);
    await this.campaignRepository.remove(campaign);
  }

  async publish(id: string): Promise<Campaign> {
    const campaign = await this.findOne(id);

    if (campaign.status !== CampaignStatus.CREATED) {
      throw new BadRequestException(
        `Campaign can only be published from CREATED status`,
      );
    }

    campaign.status = CampaignStatus.PUBLISHED;
    return this.campaignRepository.save(campaign);
  }

  async close(id: string): Promise<Campaign> {
    const campaign = await this.findOne(id);

    if (campaign.status !== CampaignStatus.PUBLISHED) {
      throw new BadRequestException(
        `Campaign can only be closed from PUBLISHED status`,
      );
    }

    campaign.status = CampaignStatus.CLOSED;
    return this.campaignRepository.save(campaign);
  }
}
