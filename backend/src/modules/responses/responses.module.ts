import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponsesService } from './responses.service';
import { ResponsesController } from './responses.controller';
import { Response, ResponseItem } from './entities';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { Question } from '../surveys/entities/question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Response, ResponseItem, Campaign, Question])],
  controllers: [ResponsesController],
  providers: [ResponsesService],
  exports: [ResponsesService],
})
export class ResponsesModule {}
