export interface User {
  id: string
  email: string
  role: 'ADMIN' | 'RESPONDENT'
  firstName?: string
  lastName?: string
}

export interface LoginResponse {
  accessToken: string
  user: User
}

export interface RegisterDto {
  email: string
  password: string
  firstName?: string
  lastName?: string
  role?: 'ADMIN' | 'RESPONDENT'
}

export interface Survey {
  id: string
  title: string
  description?: string
  createdAt: string
  updatedAt: string
  versions?: SurveyVersion[]
}

export interface SurveyVersion {
  id: string
  versionNumber: number
  changeLog?: string
  isActive: boolean
  createdAt: string
  questions?: Question[]
}

export interface Question {
  id: string
  text: string
  type: 'TEXT' | 'NUMBER' | 'MULTIPLE_CHOICE' | 'CHECKBOX' | 'SCALE' | 'FILE_UPLOAD'
  required: boolean
  orderIndex: number
  validationRules?: Record<string, any>
  options?: QuestionOption[]
}

export interface QuestionOption {
  id: string
  text: string
  value?: string
  orderIndex: number
}

export interface Campaign {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  status: 'CREATED' | 'PUBLISHED' | 'CLOSED'
  surveyVersion: SurveyVersion
  createdAt: string
  updatedAt: string
}

export interface Response {
  id: string
  campaignId: string
  userId?: string
  anonymousId?: string
  startedAt: string
  completedAt: string
  completionTimeSeconds: number
  items: ResponseItem[]
}

export interface ResponseItem {
  id: string
  questionId: string
  value: any
}

export interface CampaignMetrics {
  campaignId: string
  campaignName: string
  totalResponses: number
  completedResponses: number
  completionRate: number
  averageCompletionTime: number
  authenticatedResponses: number
  anonymousResponses: number
  status: string
  startDate: string
  endDate: string
}

export interface CreateSurveyDto {
  title: string
  description?: string
}

export interface CreateCampaignDto {
  name: string
  description?: string
  startDate: string
  endDate: string
  surveyVersionId: string
}
