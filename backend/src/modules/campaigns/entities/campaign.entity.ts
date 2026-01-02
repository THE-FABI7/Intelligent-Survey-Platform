import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CampaignStatus } from '@common/enums';
import { SurveyVersion } from '../../surveys/entities/survey-version.entity';
import { Response } from '../../responses/entities/response.entity';
import { User } from '../../users/entities/user.entity';

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.CREATED,
  })
  status: CampaignStatus;

  @ManyToOne(() => SurveyVersion, (version) => version.campaigns, {
    eager: true,
  })
  surveyVersion: SurveyVersion;

  @ManyToOne(() => User)
  createdBy: User;

  @OneToMany(() => Response, (response) => response.campaign)
  responses: Response[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
