import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class ApplySurveyTemplateDto {
  @ApiProperty({ example: 'Customer Satisfaction - Q1' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Survey for Q1 cohort', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Created from CSAT template', required: false })
  @IsString()
  @IsOptional()
  changeLog?: string;
}
