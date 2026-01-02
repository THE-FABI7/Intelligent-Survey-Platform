import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Response } from './response.entity';
import { Question } from '../../surveys/entities/question.entity';

@Entity('response_items')
export class ResponseItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Response, (response) => response.items, {
    onDelete: 'CASCADE',
  })
  response: Response;

  @ManyToOne(() => Question, (question) => question.responseItems)
  question: Question;

  @Column({ type: 'jsonb', nullable: true })
  value: any;
}
