import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionDto } from './create-question.dto';

export class CreateSurveyTemplateDto {
  @ApiProperty({ example: 'Customer Satisfaction Template' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Base template for CSAT surveys', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: [CreateQuestionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  @IsNotEmpty()
  questions: CreateQuestionDto[];
}
