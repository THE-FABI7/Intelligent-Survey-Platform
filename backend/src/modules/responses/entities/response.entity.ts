import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Campaign } from '../../campaigns/entities/campaign.entity';
import { User } from '../../users/entities/user.entity';
import { ResponseItem } from './response-item.entity';

@Entity('responses')
export class Response {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Campaign, (campaign) => campaign.responses, {
    eager: true,
  })
  campaign: Campaign;

  @ManyToOne(() => User, (user) => user.responses, { nullable: true })
  user: User;

  @Column({ type: 'varchar', nullable: true })
  anonymousId: string;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'int', nullable: true })
  completionTimeSeconds: number;

  @OneToMany(() => ResponseItem, (item) => item.response, { cascade: true })
  items: ResponseItem[];

  @CreateDateColumn()
  createdAt: Date;
}
