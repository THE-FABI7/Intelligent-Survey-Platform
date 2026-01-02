import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class ResponseItemDto {
  @ApiProperty({ example: 'uuid-of-question' })
  @IsUUID()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({ example: 'My answer' })
  @IsNotEmpty()
  value: any;
}

export class SubmitResponseDto {
  @ApiProperty({ example: 'uuid-of-campaign' })
  @IsUUID()
  @IsNotEmpty()
  campaignId: string;

  @ApiProperty({ example: 'anonymous-user-123', required: false })
  @IsOptional()
  anonymousId?: string;

  @ApiProperty({ type: [ResponseItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseItemDto)
  @IsNotEmpty()
  items: ResponseItemDto[];
}
