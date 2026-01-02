import http from './http'
import { Survey, SurveyVersion, CreateSurveyDto } from './types'

export const surveyService = {
  async getAll(): Promise<Survey[]> {
    const response = await http.get<Survey[]>('/surveys')
    return response.data
  },

  async getById(id: string): Promise<Survey> {
    const response = await http.get<Survey>(`/surveys/${id}`)
    return response.data
  },

  async create(data: CreateSurveyDto): Promise<Survey> {
    const response = await http.post<Survey>('/surveys', data)
    return response.data
  },

  async update(id: string, data: Partial<CreateSurveyDto>): Promise<Survey> {
    const response = await http.patch<Survey>(`/surveys/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await http.delete(`/surveys/${id}`)
  },

  async getVersions(surveyId: string): Promise<SurveyVersion[]> {
    const response = await http.get<SurveyVersion[]>(`/surveys/${surveyId}/versions`)
    return response.data
  },

  async getVersion(surveyId: string, versionId: string): Promise<SurveyVersion> {
    const response = await http.get<SurveyVersion>(
      `/surveys/${surveyId}/versions/${versionId}`
    )
    return response.data
  },
}
