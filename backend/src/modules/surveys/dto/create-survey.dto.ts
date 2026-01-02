import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateSurveyDto {
  @ApiProperty({ example: 'Customer Satisfaction Survey' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Help us improve our services',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
