import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from '../responses/entities/response.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Response)
    private responseRepository: Repository<Response>,
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
  ) {}

  async getCampaignMetrics(campaignId: string) {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }

    const responses = await this.responseRepository.find({
      where: { campaign: { id: campaignId } },
    });

    const totalResponses = responses.length;

    const completedResponses = responses.filter(
      (r) => r.completedAt !== null,
    ).length;

    const completionRate =
      totalResponses > 0 ? (completedResponses / totalResponses) * 100 : 0;

    const completionTimes = responses
      .filter((r) => r.completionTimeSeconds !== null)
      .map((r) => r.completionTimeSeconds);

    const averageCompletionTime =
      completionTimes.length > 0
        ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
        : 0;

    const authenticatedResponses = responses.filter((r) => r.user !== null).length;
    const anonymousResponses = responses.filter((r) => r.user === null).length;

    return {
      campaignId,
      campaignName: campaign.name,
      totalResponses,
      completedResponses,
      completionRate: Math.round(completionRate * 100) / 100,
      averageCompletionTime: Math.round(averageCompletionTime * 100) / 100,
      authenticatedResponses,
      anonymousResponses,
      status: campaign.status,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
    };
  }

  async getQuestionAnalytics(campaignId: string, questionId: string) {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }

    const responses = await this.responseRepository
      .createQueryBuilder('response')
      .leftJoinAndSelect('response.items', 'item')
      .leftJoinAndSelect('item.question', 'question')
      .where('response.campaignId = :campaignId', { campaignId })
      .andWhere('question.id = :questionId', { questionId })
      .getMany();

    const answerDistribution: { [key: string]: number } = {};

    responses.forEach((response) => {
      response.items.forEach((item) => {
        if (item.question.id === questionId) {
          const valueKey = JSON.stringify(item.value);
          answerDistribution[valueKey] =
            (answerDistribution[valueKey] || 0) + 1;
        }
      });
    });

    return {
      questionId,
      totalAnswers: responses.length,
      answerDistribution,
    };
  }
}
