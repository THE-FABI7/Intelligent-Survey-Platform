import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Survey } from './survey.entity';
import { Question } from './question.entity';
import { Campaign } from '../../campaigns/entities/campaign.entity';

@Entity('survey_versions')
export class SurveyVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  versionNumber: number;

  @Column({ type: 'text', nullable: true })
  changeLog: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Survey, (survey) => survey.versions, { onDelete: 'CASCADE' })
  survey: Survey;

  @OneToMany(() => Question, (question) => question.surveyVersion, {
    cascade: true,
  })
  questions: Question[];

  @OneToMany(() => Campaign, (campaign) => campaign.surveyVersion)
  campaigns: Campaign[];

  @CreateDateColumn()
  createdAt: Date;
}
