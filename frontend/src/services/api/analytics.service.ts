import http from './http'
import { CampaignMetrics, QuestionAnalytics, SurveySummary } from './types'

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
  ): Promise<QuestionAnalytics> {
    const response = await http.get<QuestionAnalytics>(
      `/analytics/campaigns/${campaignId}/questions/${questionId}`
    )
    return response.data
  },

  async getSurveySummary(surveyId: string): Promise<SurveySummary> {
    const response = await http.get<SurveySummary>(`/analytics/surveys/${surveyId}/summary`)
    return response.data
  },

  async exportCampaignCsv(campaignId: string): Promise<string> {
    const response = await http.get<string>(`/analytics/campaigns/${campaignId}/export`)
    return response.data
  },
}
