import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionDto } from './create-question.dto';

export class CreateSurveyVersionDto {
  @ApiProperty({ example: 'Initial version' })
  @IsString()
  @IsOptional()
  changeLog?: string;

  @ApiProperty({ type: [CreateQuestionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  @IsNotEmpty()
  questions: CreateQuestionDto[];
}
