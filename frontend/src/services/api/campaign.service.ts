import http from './http'
import { Campaign, CreateCampaignDto } from './types'

export const campaignService = {
  async getAll(): Promise<Campaign[]> {
    const response = await http.get<Campaign[]>('/campaigns')
    return response.data
  },

  async getAvailable(): Promise<Campaign[]> {
    const response = await http.get<Campaign[]>('/campaigns/available')
    return response.data
  },

  async getById(id: string): Promise<Campaign> {
    const response = await http.get<Campaign>(`/campaigns/${id}`)
    return response.data
  },

  async getPublicById(id: string): Promise<Campaign> {
    const response = await http.get<Campaign>(`/campaigns/public/${id}`)
    return response.data
  },

  async create(data: CreateCampaignDto): Promise<Campaign> {
    const response = await http.post<Campaign>('/campaigns', data)
    return response.data
  },

  async update(id: string, data: Partial<CreateCampaignDto>): Promise<Campaign> {
    const response = await http.patch<Campaign>(`/campaigns/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await http.delete(`/campaigns/${id}`)
  },

  async publish(id: string): Promise<Campaign> {
    const response = await http.post<Campaign>(`/campaigns/${id}/publish`)
    return response.data
  },

  async close(id: string): Promise<Campaign> {
    const response = await http.post<Campaign>(`/campaigns/${id}/close`)
    return response.data
  },
}
