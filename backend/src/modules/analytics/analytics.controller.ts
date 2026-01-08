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

  @Get('campaigns/:campaignId/questions')
  @ApiOperation({ summary: 'Get analytics for all questions in a campaign (Admin only)' })
  @ApiResponse({ status: 200, description: 'Questions analytics' })
  getQuestionsAnalytics(@Param('campaignId') campaignId: string) {
    return this.analyticsService.getCampaignQuestionsAnalytics(campaignId);
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

  @Get('surveys/:surveyId/summary')
  @ApiOperation({ summary: 'Get admin summary for a survey (campaigns, alerts, recent responses)' })
  @ApiResponse({ status: 200, description: 'Survey summary' })
  getSurveySummary(@Param('surveyId') surveyId: string) {
    return this.analyticsService.getSurveySummary(surveyId);
  }

  @Get('campaigns/:campaignId/export')
  @ApiOperation({ summary: 'Export campaign responses to CSV (Admin only)' })
  @ApiResponse({ status: 200, description: 'CSV export' })
  async exportCampaign(@Param('campaignId') campaignId: string) {
    const csv = await this.analyticsService.exportCampaignCsv(campaignId);
    return csv;
  }

  @Get('campaigns/:campaignId/export.xlsx')
  @ApiOperation({ summary: 'Export campaign responses to Excel-compatible CSV (Admin only)' })
  @ApiResponse({ status: 200, description: 'Excel export' })
  async exportCampaignExcel(@Param('campaignId') campaignId: string) {
    const csv = await this.analyticsService.exportCampaignCsv(campaignId);
    return csv;
  }

  @Get('campaigns/:campaignId/raw')
  @ApiOperation({ summary: 'Get raw responses for a campaign (Admin only)' })
  @ApiResponse({ status: 200, description: 'Raw responses' })
  getRawResponses(@Param('campaignId') campaignId: string) {
    return this.analyticsService.getCampaignRawResponses(campaignId);
  }
}
