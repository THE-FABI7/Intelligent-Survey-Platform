import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SurveysService } from './surveys.service';
import {
  CreateSurveyDto,
  UpdateSurveyDto,
  CreateSurveyVersionDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '@common/guards';
import { Roles, CurrentUser } from '@common/decorators';
import { UserRole } from '@common/enums';

@ApiTags('Surveys')
@Controller('surveys')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT')
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new survey (Admin only)' })
  @ApiResponse({ status: 201, description: 'Survey created successfully' })
  create(@Body() createSurveyDto: CreateSurveyDto, @CurrentUser() user: any) {
    return this.surveysService.create(createSurveyDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all surveys' })
  @ApiResponse({ status: 200, description: 'List of all surveys' })
  findAll() {
    return this.surveysService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a survey by ID' })
  @ApiResponse({ status: 200, description: 'Survey details' })
  @ApiResponse({ status: 404, description: 'Survey not found' })
  findOne(@Param('id') id: string) {
    return this.surveysService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a survey (Admin only)' })
  @ApiResponse({ status: 200, description: 'Survey updated successfully' })
  update(@Param('id') id: string, @Body() updateSurveyDto: UpdateSurveyDto) {
    return this.surveysService.update(id, updateSurveyDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a survey (Admin only)' })
  @ApiResponse({ status: 200, description: 'Survey deleted successfully' })
  remove(@Param('id') id: string) {
    return this.surveysService.remove(id);
  }

  @Post(':id/versions')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new version for a survey (Admin only)' })
  @ApiResponse({ status: 201, description: 'Version created successfully' })
  createVersion(
    @Param('id') id: string,
    @Body() createVersionDto: CreateSurveyVersionDto,
  ) {
    return this.surveysService.createVersion(id, createVersionDto);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Get all versions of a survey' })
  @ApiResponse({ status: 200, description: 'List of survey versions' })
  findVersions(@Param('id') id: string) {
    return this.surveysService.findVersions(id);
  }

  @Get(':id/versions/:versionId')
  @ApiOperation({ summary: 'Get a specific version of a survey' })
  @ApiResponse({ status: 200, description: 'Survey version details' })
  findVersion(@Param('id') id: string, @Param('versionId') versionId: string) {
    return this.surveysService.findVersion(id, versionId);
  }
}
