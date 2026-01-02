import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard, RolesGuard } from '@common/guards';
import { Roles } from '@common/decorators';
import { UserRole } from '@common/enums';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('campaigns/:campaignId')
  @ApiOperation({ summary: 'Get analytics for a campaign (Admin only)' })
  @ApiResponse({ status: 200, description: 'Campaign analytics' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  getCampaignMetrics(@Param('campaignId') campaignId: string) {
    return this.analyticsService.getCampaignMetrics(campaignId);
  }

  @Get('campaigns/:campaignId/questions/:questionId')
  @ApiOperation({
    summary: 'Get analytics for a specific question in a campaign (Admin only)',
  })
  @ApiResponse({ status: 200, description: 'Question analytics' })
  getQuestionAnalytics(
    @Param('campaignId') campaignId: string,
    @Param('questionId') questionId: string,
  ) {
    return this.analyticsService.getQuestionAnalytics(campaignId, questionId);
  }
}
