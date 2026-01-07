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
  createdBy?: User
  versions?: SurveyVersion[]
  versionsCount?: number
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
  code?: string
  text: string
  type: 'TEXT' | 'NUMBER' | 'MULTIPLE_CHOICE' | 'CHECKBOX' | 'SCALE' | 'FILE_UPLOAD'
  required: boolean
  orderIndex: number
  validationRules?: Record<string, any>
  options?: QuestionOption[]
  visibilityConditions?: VisibilityCondition[]
}

export interface QuestionOption {
  id: string
  text: string
  value?: string
  orderIndex: number
}

export type VisibilityOperator =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'IN'
  | 'NOT_IN'
  | 'GREATER_THAN'
  | 'GREATER_OR_EQUAL'
  | 'LESS_THAN'
  | 'LESS_OR_EQUAL'
  | 'CONTAINS'
  | 'NOT_CONTAINS'
  | 'IS_EMPTY'
  | 'IS_NOT_EMPTY'

export interface VisibilityCondition {
  questionCode: string
  operator: VisibilityOperator
  value?: any
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

export interface CreateQuestionDto {
  text: string
  type: Question['type']
  code?: string
  required?: boolean
  orderIndex?: number
  validationRules?: Record<string, any>
  options?: Array<{
    text: string
    value?: string
    orderIndex?: number
  }>
  visibilityConditions?: VisibilityCondition[]
}

export interface CreateSurveyVersionDto {
  changeLog?: string
  isActive?: boolean
  questions: CreateQuestionDto[]
}

export interface SurveyTemplate {
  id: string
  name: string
  description?: string
  createdAt: string
  createdBy?: User
  questions: CreateQuestionDto[]
}

export interface CreateSurveyTemplateDto {
  name: string
  description?: string
  questions: CreateQuestionDto[]
}

export interface ApplySurveyTemplateDto {
  title?: string
  description?: string
  changeLog?: string
}

export interface CreateCampaignDto {
  name: string
  description?: string
  startDate: string
  endDate: string
  surveyVersionId: string
}
