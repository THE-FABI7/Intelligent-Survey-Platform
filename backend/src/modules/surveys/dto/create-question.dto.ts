import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType, VisibilityOperator } from '@common/enums';
import { VisibilityCondition } from '../types/visibility-condition.type';

class QuestionOptionDto {
  @ApiProperty({ example: 'Option 1' })
  @IsString()
  text: string;

  @ApiProperty({ example: 'option_1', required: false })
  @IsString()
  @IsOptional()
  value?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsOptional()
  orderIndex?: number;
}

class VisibilityConditionDto implements VisibilityCondition {
  @ApiProperty({ example: 'q1' })
  @IsString()
  questionCode: string;

  @ApiProperty({ enum: VisibilityOperator })
  @IsEnum(VisibilityOperator)
  operator: VisibilityOperator;

  @ApiProperty({ example: 'YES', required: false, description: 'Value compared against the referenced question answer' })
  @IsOptional()
  value?: any;
}

export class CreateQuestionDto {
  @ApiProperty({ example: 'How satisfied are you with our service?' })
  @IsString()
  text: string;

  @ApiProperty({ example: 'q1', required: false, description: 'Stable code used to reference the question in skip logic' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ enum: QuestionType, example: QuestionType.MULTIPLE_CHOICE })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiProperty({ example: true, default: false })
  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsOptional()
  orderIndex?: number;

  @ApiProperty({
    example: { min: 1, max: 10 },
    required: false,
  })
  @IsObject()
  @IsOptional()
  validationRules?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    allowedExtensions?: string[];
  };

  @ApiProperty({ type: [QuestionOptionDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  @IsOptional()
  options?: QuestionOptionDto[];

  @ApiProperty({ type: [VisibilityConditionDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VisibilityConditionDto)
  @IsOptional()
  visibilityConditions?: VisibilityCondition[];
}
