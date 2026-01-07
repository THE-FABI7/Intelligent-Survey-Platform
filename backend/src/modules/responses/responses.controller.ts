import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ResponsesService } from './responses.service';
import { SubmitResponseDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '@common/guards';
import { Roles, CurrentUser } from '@common/decorators';
import { UserRole } from '@common/enums';

@ApiTags('Responses')
@Controller('responses')
export class ResponsesController {
  constructor(private readonly responsesService: ResponsesService) {}

  @Post('submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESPONDENT)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Submit a response to a campaign (respondents only)' })
  @ApiResponse({ status: 201, description: 'Response submitted successfully' })
  async submit(
    @Body() submitResponseDto: SubmitResponseDto,
    @CurrentUser() user: any,
  ) {
    return this.responsesService.submit(submitResponseDto, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get all responses (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all responses' })
  findAll() {
    return this.responsesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get a response by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Response details' })
  @ApiResponse({ status: 404, description: 'Response not found' })
  findOne(@Param('id') id: string) {
    return this.responsesService.findOne(id);
  }

  @Get('campaign/:campaignId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get all responses for a campaign (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of campaign responses' })
  findByCampaign(@Param('campaignId') campaignId: string) {
    return this.responsesService.findByCampaign(campaignId);
  }
}
