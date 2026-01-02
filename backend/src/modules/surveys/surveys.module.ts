import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveysService } from './surveys.service';
import { SurveysController } from './surveys.controller';
import { Survey, SurveyVersion, Question, QuestionOption } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Survey, SurveyVersion, Question, QuestionOption]),
  ],
  controllers: [SurveysController],
  providers: [SurveysService],
  exports: [SurveysService],
})
export class SurveysModule {}
