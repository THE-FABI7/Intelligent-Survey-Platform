import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Response } from '../responses/entities/response.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { Question } from '../surveys/entities/question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Response, Campaign, Question])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
