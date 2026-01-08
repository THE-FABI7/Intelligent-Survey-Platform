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

  async getQuestionsAnalytics(campaignId: string): Promise<any[]> {
    const response = await http.get<any[]>(`/analytics/campaigns/${campaignId}/questions`)
    return response.data
  },

  async exportCsv(campaignId: string): Promise<Blob> {
    const response = await http.get(`/analytics/campaigns/${campaignId}/export`, {
      responseType: 'blob',
    })
    return response.data
  },

  async exportExcel(campaignId: string): Promise<Blob> {
    const response = await http.get(`/analytics/campaigns/${campaignId}/export.xlsx`, {
      responseType: 'blob',
    })
    return response.data
  },

  async getRawResponses(campaignId: string): Promise<any[]> {
    const response = await http.get<any[]>(`/analytics/campaigns/${campaignId}/raw`)
    return response.data
  },
}
