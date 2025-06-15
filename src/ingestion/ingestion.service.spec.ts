import { Test, TestingModule } from '@nestjs/testing';
import { IngestionService } from './ingestion.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IngestionJob, IngestionStatus } from './entities/ingestion-job.entity';
import { Repository } from 'typeorm';
import { DocumentsService } from '../documents/documents.service';
import { DocumentStatus } from '../documents/entities/document.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateIngestionJobDto } from './dto/create-ingestion-job.dto';

describe('IngestionService', () => {
  let service: IngestionService;
  let repo: Repository<IngestionJob>;
  let documentsService: DocumentsService;

  const mockJob: IngestionJob = {
    id: 'job-1',
    documentId: 'doc-1',
    status: IngestionStatus.PENDING,
    progress: 0,
    errorMessage: null,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn().mockImplementation((dto: CreateIngestionJobDto) => ({
      ...mockJob,
      ...dto,
    })),
    save: jest.fn().mockResolvedValue(mockJob),
    find: jest.fn().mockResolvedValue([mockJob]),
    findOne: jest.fn().mockResolvedValue(mockJob),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn(),
  };

  const mockDocumentsService = {
    updateStatus: jest
      .fn()
      .mockResolvedValue({ id: 'doc-1', status: DocumentStatus.COMPLETED }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        { provide: getRepositoryToken(IngestionJob), useValue: mockRepository },
        { provide: DocumentsService, useValue: mockDocumentsService },
      ],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
    repo = module.get<Repository<IngestionJob>>(
      getRepositoryToken(IngestionJob),
    );
    documentsService = module.get<DocumentsService>(DocumentsService);
  });

  it('should create and process ingestion job', async () => {
    const dto: CreateIngestionJobDto = {
      documentId: 'doc-1',
      metadata: { user: 'test' },
    };
    const job = await service.create(dto);
    expect(job.documentId).toEqual(dto.documentId);
    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(repo.save).toHaveBeenCalled();
  }, 15000);

  it('should throw NotFoundException on invalid job ID in findOne', async () => {
    jest.spyOn(repo, 'findOne').mockResolvedValueOnce(null);
    await expect(service.findOne('invalid-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update status and retrieve updated job', async () => {
    const updatedJob = await service.updateStatus(
      'job-1',
      IngestionStatus.RUNNING,
      50,
    );
    expect(repo.update).toHaveBeenCalledWith('job-1', {
      status: IngestionStatus.RUNNING,
      progress: 50,
      errorMessage: undefined,
    });
    expect(updatedJob).toEqual(mockJob);
  });

  it('should trigger ingestion and update document status', async () => {
    const job = await service.triggerIngestion('doc-1');
    expect(documentsService.updateStatus).toHaveBeenCalledWith(
      'doc-1',
      DocumentStatus.PROCESSING,
    );
    expect(job.documentId).toEqual('doc-1');
  }, 15000);

  it('should cancel a running job', async () => {
    jest
      .spyOn(service, 'findOne')
      .mockResolvedValueOnce({ ...mockJob, status: IngestionStatus.RUNNING });
    const result = await service.cancelJob('job-1');
    expect(result).toEqual(mockJob);
    expect(repo.update).toHaveBeenCalledWith(
      'job-1',
      expect.objectContaining({
        status: IngestionStatus.FAILED,
        errorMessage: 'Job cancelled by user',
      }),
    );
  });

  it('should get jobs by document ID', async () => {
    const jobs = await service.getJobsByDocument('doc-1');
    expect(jobs).toEqual([mockJob]);
    expect(repo.find).toHaveBeenCalledWith({
      where: { documentId: 'doc-1' },
      order: { createdAt: 'DESC' },
    });
  });
});
