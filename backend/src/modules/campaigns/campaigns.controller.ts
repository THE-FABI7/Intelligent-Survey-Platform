import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '@common/guards';
import { Roles, CurrentUser } from '@common/decorators';
import { UserRole } from '@common/enums';

@ApiTags('Campaigns')
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new campaign (Admin only)' })
  @ApiResponse({ status: 201, description: 'Campaign created successfully' })
  create(
    @Body() createCampaignDto: CreateCampaignDto,
    @CurrentUser() user: any,
  ) {
    return this.campaignsService.create(createCampaignDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all campaigns' })
  @ApiResponse({ status: 200, description: 'List of all campaigns' })
  findAll() {
    return this.campaignsService.findAll();
  }

  @Get('available')
  @ApiOperation({ summary: 'Get active campaigns for respondents' })
  @ApiResponse({ status: 200, description: 'List of active published campaigns' })
  findAvailable() {
    return this.campaignsService.findAvailable();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a campaign by ID' })
  @ApiResponse({ status: 200, description: 'Campaign details' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @Get('public/:id')
  @ApiOperation({ summary: 'Get a published & active campaign (respondents)' })
  @ApiResponse({ status: 200, description: 'Campaign details' })
  @ApiResponse({ status: 400, description: 'Campaign not active/published' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  findPublic(@Param('id') id: string) {
    return this.campaignsService.findPublicById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a campaign (Admin only)' })
  @ApiResponse({ status: 200, description: 'Campaign updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    return this.campaignsService.update(id, updateCampaignDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a campaign (Admin only)' })
  @ApiResponse({ status: 200, description: 'Campaign deleted successfully' })
  remove(@Param('id') id: string) {
    return this.campaignsService.remove(id);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish a campaign (Admin only)' })
  @ApiResponse({ status: 200, description: 'Campaign published successfully' })
  publish(@Param('id') id: string) {
    return this.campaignsService.publish(id);
  }

  @Post(':id/close')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Close a campaign (Admin only)' })
  @ApiResponse({ status: 200, description: 'Campaign closed successfully' })
  close(@Param('id') id: string) {
    return this.campaignsService.close(id);
  }
}
