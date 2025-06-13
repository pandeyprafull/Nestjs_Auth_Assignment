import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { IngestionService } from './ingestion.service';
import { CreateIngestionJobDto } from './dto/create-ingestion-job.dto';
import { TriggerIngestionDto } from './dto/trigger-ingestion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Ingestion')
@ApiBearerAuth()
@Controller('ingestion')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @ApiOperation({ summary: 'Trigger document ingestion' })
  @ApiResponse({
    status: 201,
    description: 'Ingestion job created and started',
  })
  @Post('trigger')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  triggerIngestion(@Body() triggerIngestionDto: TriggerIngestionDto) {
    return this.ingestionService.triggerIngestion(
      triggerIngestionDto.documentId,
    );
  }

  @ApiOperation({ summary: 'Create ingestion job manually' })
  @ApiResponse({ status: 201, description: 'Ingestion job created' })
  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createIngestionJobDto: CreateIngestionJobDto) {
    return this.ingestionService.create(createIngestionJobDto);
  }

  @ApiOperation({ summary: 'Get all ingestion jobs' })
  @ApiResponse({ status: 200, description: 'Returns all ingestion jobs' })
  @Get()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  findAll() {
    return this.ingestionService.findAll();
  }

  @ApiOperation({ summary: 'Get ingestion job by ID' })
  @ApiResponse({ status: 200, description: 'Returns ingestion job by ID' })
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  findOne(@Param('id') id: string) {
    return this.ingestionService.findOne(id);
  }

  @ApiOperation({ summary: 'Get ingestion jobs by document ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns ingestion jobs for a document',
  })
  @Get('document/:documentId')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  getJobsByDocument(@Param('documentId') documentId: string) {
    return this.ingestionService.getJobsByDocument(documentId);
  }

  @ApiOperation({ summary: 'Cancel ingestion job' })
  @ApiResponse({ status: 200, description: 'Ingestion job cancelled' })
  @Patch(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  cancelJob(@Param('id') id: string) {
    return this.ingestionService.cancelJob(id);
  }
}
