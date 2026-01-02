import http from './http'
import { CampaignMetrics } from './types'

export const analyticsService = {
  async getCampaignMetrics(campaignId: string): Promise<CampaignMetrics> {
    const response = await http.get<CampaignMetrics>(
      `/analytics/campaigns/${campaignId}`
    )
    return response.data
  },

  async getQuestionAnalytics(
    campaignId: string,
    questionId: string
  ): Promise<any> {
    const response = await http.get(
      `/analytics/campaigns/${campaignId}/questions/${questionId}`
    )
    return response.data
  },
}
