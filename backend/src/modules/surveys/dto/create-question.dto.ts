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
import { QuestionType } from '@common/enums';

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

export class CreateQuestionDto {
  @ApiProperty({ example: 'How satisfied are you with our service?' })
  @IsString()
  text: string;

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
}
