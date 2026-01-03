import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { QuestionType } from '@common/enums';
import { VisibilityCondition } from '../types/visibility-condition.type';

export interface TemplateQuestionOption {
  text: string;
  value?: string;
  orderIndex?: number;
}

export interface TemplateQuestion {
  text: string;
  code?: string;
  type: QuestionType;
  required?: boolean;
  orderIndex?: number;
  validationRules?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    allowedExtensions?: string[];
  };
  options?: TemplateQuestionOption[];
  visibilityConditions?: VisibilityCondition[];
}

@Entity('survey_templates')
export class SurveyTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb' })
  questions: TemplateQuestion[];

  @ManyToOne(() => User)
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
