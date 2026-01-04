import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from '../responses/entities/response.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { Question } from '../surveys/entities';
import { QuestionType } from '@common/enums';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Response)
    private responseRepository: Repository<Response>,
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  private topWords(values: string[], limit = 15) {
    const stopwords = new Set([
      'the','a','an','and','or','of','to','in','on','for','with','is','are','was','were','be','been','it','this','that','these','those','i','you','we','they','he','she','them','as','at','by','from','about','but','not','no','yes','do','did','does','have','has','had','your','our','their','my'
    ]);
    const counts: Record<string, number> = {};
    for (const text of values) {
      const words = text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean)
        .filter((w) => !stopwords.has(w));
      for (const w of words) {
        counts[w] = (counts[w] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([term, count]) => ({ term, count }));
  }

  private basicSentiment(values: string[]) {
    const positive = new Set(['good','great','excellent','love','like','amazing','happy','satisfied','positive','awesome','fantastic']);
    const negative = new Set(['bad','terrible','awful','hate','dislike','angry','sad','unsatisfied','negative','poor','worst']);
    let pos = 0;
    let neg = 0;
    for (const text of values) {
      const lower = text.toLowerCase();
      for (const word of positive) {
        if (lower.includes(word)) pos++;
      }
      for (const word of negative) {
        if (lower.includes(word)) neg++;
      }
    }
    const total = values.length || 1;
    const neutral = Math.max(total - pos - neg, 0);
    return { positive: pos, negative: neg, neutral };
  }

  private numericStats(values: number[]) {
    if (values.length === 0) {
      return { count: 0, average: 0, median: 0, min: 0, max: 0, histogram: [] };
    }
    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const average = sum / values.length;
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const bucketCount = 10;
    const width = max === min ? 1 : (max - min) / bucketCount;
    const histogram: { bucketStart: number; bucketEnd: number; count: number }[] = [];
    for (let i = 0; i < bucketCount; i++) {
      const start = min + i * width;
      const end = i === bucketCount - 1 ? max : start + width;
      histogram.push({ bucketStart: start, bucketEnd: end, count: 0 });
    }
    for (const value of values) {
      const idx = width === 1 && min === max ? 0 : Math.min(Math.floor((value - min) / width), bucketCount - 1);
      histogram[idx].count += 1;
    }
    return { count: values.length, average, median, min, max, histogram };
  }

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

    const question = await this.questionRepository.findOne({ where: { id: questionId } });

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    const responses = await this.responseRepository
      .createQueryBuilder('response')
      .leftJoinAndSelect('response.items', 'item')
      .where('response.campaignId = :campaignId', { campaignId })
      .andWhere('item.questionId = :questionId', { questionId })
      .getMany();

    const answers = responses.flatMap((r) => r.items.map((i) => i.value));

    const base = {
      questionId,
      questionText: question.text,
      type: question.type,
      totalAnswers: answers.length,
    } as any;

    if (
      question.type === QuestionType.MULTIPLE_CHOICE ||
      question.type === QuestionType.CHECKBOX
    ) {
      const distribution: { key: string; count: number }[] = [];
      const counter: Record<string, number> = {};
      for (const ans of answers) {
        if (Array.isArray(ans)) {
          ans.forEach((val) => {
            const k = String(val);
            counter[k] = (counter[k] || 0) + 1;
          });
        } else {
          const k = String(ans);
          counter[k] = (counter[k] || 0) + 1;
        }
      }
      Object.entries(counter).forEach(([key, count]) => {
        distribution.push({ key, count });
      });
      return { ...base, distribution };
    }

    if (question.type === QuestionType.NUMBER || question.type === QuestionType.SCALE) {
      const numericValues = answers
        .map((v) => (typeof v === 'number' ? v : Number(v)))
        .filter((v) => !Number.isNaN(v));
      return { ...base, ...this.numericStats(numericValues) };
    }

    if (question.type === QuestionType.TEXT) {
      const textValues = answers
        .map((v) => (typeof v === 'string' ? v : String(v ?? '')))
        .filter((v) => v.trim().length > 0);
      return {
        ...base,
        topWords: this.topWords(textValues),
        sentiment: this.basicSentiment(textValues),
      };
    }

    return { ...base, rawAnswers: answers };
  }

  async getSurveySummary(surveyId: string) {
    const campaigns = await this.campaignRepository
      .createQueryBuilder('campaign')
      .leftJoinAndSelect('campaign.surveyVersion', 'version')
      .leftJoin('version.survey', 'survey')
      .where('survey.id = :surveyId', { surveyId })
      .getMany();

    const active = campaigns.filter((c) => c.status === 'PUBLISHED').length;
    const closed = campaigns.filter((c) => c.status === 'CLOSED').length;

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const responsesLastMonth = await this.responseRepository
      .createQueryBuilder('response')
      .where('response.createdAt >= :since', { since: monthAgo })
      .getCount();

    const alerts = campaigns
      .filter((c) => {
        const now = new Date();
        const hoursToEnd = (c.endDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        return c.status === 'PUBLISHED' && hoursToEnd <= 24;
      })
      .map((c) => ({
        campaignId: c.id,
        name: c.name,
        endsAt: c.endDate,
        message: 'Campaign closing in <24h',
      }));

    return {
      surveyId,
      activeCampaigns: active,
      closedCampaigns: closed,
      responsesLastMonth,
      alerts,
    };
  }

  async exportCampaignCsv(campaignId: string): Promise<string> {
    const responses = await this.responseRepository.find({
      where: { campaign: { id: campaignId } },
      relations: ['items', 'items.question'],
    });

    const rows: string[] = [];
    rows.push('responseId,questionId,questionText,value,createdAt');
    for (const r of responses) {
      for (const item of r.items) {
        const value = typeof item.value === 'object' ? JSON.stringify(item.value) : item.value;
        rows.push([
          r.id,
          item.question?.id || '',
          `"${item.question?.text?.replace(/"/g, '""') || ''}"`,
          `"${String(value ?? '').replace(/"/g, '""')}"`,
          r.createdAt.toISOString(),
        ].join(','));
      }
    }

    return rows.join('\n');
  }
}
