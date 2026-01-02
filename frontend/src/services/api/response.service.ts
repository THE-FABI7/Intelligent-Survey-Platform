import http from './http'
import { Response } from './types'

export const responseService = {
  async getAll(): Promise<Response[]> {
    const response = await http.get<Response[]>('/responses')
    return response.data
  },

  async getById(id: string): Promise<Response> {
    const response = await http.get<Response>(`/responses/${id}`)
    return response.data
  },

  async getByCampaign(campaignId: string): Promise<Response[]> {
    const response = await http.get<Response[]>(`/responses/campaign/${campaignId}`)
    return response.data
  },
}
