/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IngestionJob, IngestionStatus } from './entities/ingestion-job.entity';
import { CreateIngestionJobDto } from './dto/create-ingestion-job.dto';
import { DocumentsService } from '../documents/documents.service';
import { DocumentStatus } from '../documents/entities/document.entity';

@Injectable()
export class IngestionService {
  constructor(
    @InjectRepository(IngestionJob)
    private ingestionJobsRepository: Repository<IngestionJob>,
    private documentsService: DocumentsService,
  ) {}

  async create(
    createIngestionJobDto: CreateIngestionJobDto,
  ): Promise<IngestionJob> {
    const job = this.ingestionJobsRepository.create(createIngestionJobDto);
    const savedJob = await this.ingestionJobsRepository.save(job);

    // Start the ingestion process
    await this.processIngestion(savedJob.id);

    return savedJob;
  }

  async findAll(): Promise<IngestionJob[]> {
    return this.ingestionJobsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<IngestionJob> {
    const job = await this.ingestionJobsRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Ingestion job with ID ${id} not found`);
    }
    return job;
  }

  async updateStatus(
    id: string,
    status: IngestionStatus,
    progress?: number,
    errorMessage?: string,
  ): Promise<IngestionJob> {
    await this.ingestionJobsRepository.update(id, {
      status,
      progress,
      errorMessage,
    });
    return this.findOne(id);
  }

  async triggerIngestion(documentId: string): Promise<IngestionJob> {
    // Check if document exists and update its status
    await this.documentsService.updateStatus(
      documentId,
      DocumentStatus.PROCESSING,
    );

    const job = await this.create({
      documentId,
      metadata: { triggeredAt: new Date() },
    });

    return job;
  }

  private async processIngestion(jobId: string): Promise<void> {
    try {
      // Update job status to running
      await this.updateStatus(jobId, IngestionStatus.RUNNING, 0);

      // Simulate ingestion process
      const job = await this.findOne(jobId);

      // Simulate processing steps
      for (let i = 0; i <= 100; i += 20) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate work
        await this.updateStatus(jobId, IngestionStatus.RUNNING, i);
      }

      // Mark as completed
      await this.updateStatus(jobId, IngestionStatus.COMPLETED, 100);
      await this.documentsService.updateStatus(
        job.documentId,
        DocumentStatus.COMPLETED,
      );
    } catch (error) {
      // Mark as failed
      await this.updateStatus(
        jobId,
        IngestionStatus.FAILED,
        undefined,
        error.message,
      );
      const job = await this.findOne(jobId);
      await this.documentsService.updateStatus(
        job.documentId,
        DocumentStatus.FAILED,
      );
    }
  }

  async getJobsByDocument(documentId: string): Promise<IngestionJob[]> {
    return this.ingestionJobsRepository.find({
      where: { documentId },
      order: { createdAt: 'DESC' },
    });
  }

  async cancelJob(id: string): Promise<IngestionJob> {
    const job = await this.findOne(id);
    if (job.status === IngestionStatus.RUNNING) {
      await this.updateStatus(
        id,
        IngestionStatus.FAILED,
        job.progress,
        'Job cancelled by user',
      );
    }
    return this.findOne(id);
  }
}
