import http from './http'
import {
  Survey,
  SurveyVersion,
  CreateSurveyDto,
  CreateSurveyVersionDto,
  SurveyTemplate,
  CreateSurveyTemplateDto,
  ApplySurveyTemplateDto,
} from './types'

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

  async createVersion(
    surveyId: string,
    data: CreateSurveyVersionDto,
  ): Promise<SurveyVersion> {
    const response = await http.post<SurveyVersion>(
      `/surveys/${surveyId}/versions`,
      data,
    )
    return response.data
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

  async getTemplates(): Promise<SurveyTemplate[]> {
    const response = await http.get<SurveyTemplate[]>(`/surveys/templates`)
    return response.data
  },

  async getTemplate(templateId: string): Promise<SurveyTemplate> {
    const response = await http.get<SurveyTemplate>(`/surveys/templates/${templateId}`)
    return response.data
  },

  async createTemplate(data: CreateSurveyTemplateDto): Promise<SurveyTemplate> {
    const response = await http.post<SurveyTemplate>(`/surveys/templates`, data)
    return response.data
  },

  async applyTemplate(
    templateId: string,
    data: ApplySurveyTemplateDto,
  ): Promise<Survey> {
    const response = await http.post<Survey>(
      `/surveys/templates/${templateId}/apply`,
      data,
    )
    return response.data
  },
}
