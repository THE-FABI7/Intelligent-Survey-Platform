import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { QuestionType } from '@common/enums';
import { SurveyVersion } from './survey-version.entity';
import { QuestionOption } from './question-option.entity';
import { ResponseItem } from '../../responses/entities/response-item.entity';
import { VisibilityCondition } from '../types/visibility-condition.type';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  text: string;

  @Column({ nullable: true })
  code: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
  })
  type: QuestionType;

  @Column({ default: false })
  required: boolean;

  @Column({ default: 1 })
  orderIndex: number;

  @Column({ type: 'jsonb', nullable: true })
  validationRules: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    allowedExtensions?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  visibilityConditions?: VisibilityCondition[];

  @ManyToOne(() => SurveyVersion, (version) => version.questions, {
    onDelete: 'CASCADE',
  })
  surveyVersion: SurveyVersion;

  @OneToMany(() => QuestionOption, (option) => option.question, {
    cascade: true,
  })
  options: QuestionOption[];

  @OneToMany(() => ResponseItem, (item) => item.question)
  responseItems: ResponseItem[];
}
