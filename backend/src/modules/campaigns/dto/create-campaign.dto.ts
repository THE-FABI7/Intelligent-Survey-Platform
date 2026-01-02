import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsDateString, IsUUID } from 'class-validator';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Q1 2026 Customer Survey' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Quarterly customer satisfaction survey',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2026-01-15T00:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2026-01-31T23:59:59Z' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ example: 'uuid-of-survey-version' })
  @IsUUID()
  @IsNotEmpty()
  surveyVersionId: string;
}
