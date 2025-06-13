import { Test, TestingModule } from '@nestjs/testing';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { CreateIngestionJobDto } from './dto/create-ingestion-job.dto';
import { TriggerIngestionDto } from './dto/trigger-ingestion.dto';

describe('IngestionController', () => {
  let controller: IngestionController;
  let service: IngestionService;

  const mockIngestionService = {
    triggerIngestion: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    getJobsByDocument: jest.fn(),
    cancelJob: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngestionController],
      providers: [
        {
          provide: IngestionService,
          useValue: mockIngestionService,
        },
      ],
    }).compile();

    controller = module.get<IngestionController>(IngestionController);
    service = module.get<IngestionService>(IngestionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('triggerIngestion', () => {
    it('should call service.triggerIngestion and return result', async () => {
      const dto: TriggerIngestionDto = { documentId: 'doc123' };
      const result = { message: 'Ingestion triggered' };
      mockIngestionService.triggerIngestion.mockResolvedValue(result);

      expect(await controller.triggerIngestion(dto)).toEqual(result);
      expect(mockIngestionService.triggerIngestion).toHaveBeenCalledWith(
        'doc123',
      );
    });
  });

  describe('create', () => {
    it('should call service.create and return result', async () => {
      const dto: CreateIngestionJobDto = {
        documentId: 'doc123',
        metadata: {
          jobType: 'OCR',
          priority: 'HIGH',
        },
      };
      const result = { id: 'job1', ...dto };
      mockIngestionService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
      expect(mockIngestionService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all ingestion jobs', async () => {
      const result = [{ id: 'job1' }, { id: 'job2' }];
      mockIngestionService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
      expect(mockIngestionService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return ingestion job by ID', async () => {
      const result = { id: 'job1' };
      mockIngestionService.findOne.mockResolvedValue(result);

      expect(await controller.findOne('job1')).toEqual(result);
      expect(mockIngestionService.findOne).toHaveBeenCalledWith('job1');
    });
  });

  describe('getJobsByDocument', () => {
    it('should return jobs by document ID', async () => {
      const result = [{ id: 'job1', documentId: 'doc123' }];
      mockIngestionService.getJobsByDocument.mockResolvedValue(result);

      expect(await controller.getJobsByDocument('doc123')).toEqual(result);
      expect(mockIngestionService.getJobsByDocument).toHaveBeenCalledWith(
        'doc123',
      );
    });
  });

  describe('cancelJob', () => {
    it('should cancel job and return result', async () => {
      const result = { success: true };
      mockIngestionService.cancelJob.mockResolvedValue(result);

      expect(await controller.cancelJob('job1')).toEqual(result);
      expect(mockIngestionService.cancelJob).toHaveBeenCalledWith('job1');
    });
  });
});
