import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { UserRole } from '../users/entities/user.entity';
import { DocumentStatus } from './entities/document.entity';

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let service: DocumentsService;

  const mockDocument = {
    id: '1',
    description: 'Test Desc',
    filename: 'test.pdf',
    originalName: 'test.pdf',
    mimeType: 'application/pdf',
    size: 1234,
    status: 'someStatus',
    path: '/uploads/test.pdf',
    uploadedById: 'user1',
  };

  const mockDocumentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockRequest = {
    user: {
      userId: 'user1',
      role: UserRole.EDITOR,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        {
          provide: DocumentsService,
          useValue: mockDocumentsService,
        },
      ],
    }).compile();

    controller = module.get<DocumentsController>(DocumentsController);
    service = module.get<DocumentsService>(DocumentsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should call documentsService.create and return the result', async () => {
      const dto: CreateDocumentDto = {
        description: 'Test file',
      };

      const file = {
        filename: 'test.pdf',
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1234,
        path: '/uploads/test.pdf',
      } as Express.Multer.File;

      mockDocumentsService.create.mockResolvedValue(mockDocument);

      const result = await controller.create(dto, file, mockRequest);
      expect(service.create).toHaveBeenCalledWith(dto, file, 'user1');
      expect(result).toEqual(mockDocument);
    });
  });

  describe('findAll', () => {
    it('should return documents based on user role', async () => {
      mockDocumentsService.findAll.mockResolvedValue([mockDocument]);

      const result = await controller.findAll(mockRequest);
      expect(service.findAll).toHaveBeenCalledWith('user1', UserRole.EDITOR);
      expect(result).toEqual([mockDocument]);
    });
  });

  describe('findOne', () => {
    it('should return document by ID', async () => {
      mockDocumentsService.findOne.mockResolvedValue(mockDocument);

      const result = await controller.findOne('1', mockRequest);
      expect(service.findOne).toHaveBeenCalledWith(
        '1',
        'user1',
        UserRole.EDITOR,
      );
      expect(result).toEqual(mockDocument);
    });
  });

  describe('update', () => {
    it('should update and return document', async () => {
      const dto: UpdateDocumentDto = {
        description: 'Updated Desc',
      };

      mockDocumentsService.update.mockResolvedValue({
        ...mockDocument,
        ...dto,
      });

      const result = await controller.update('1', dto, mockRequest);
      expect(service.update).toHaveBeenCalledWith(
        '1',
        dto,
        'user1',
        UserRole.EDITOR,
      );
      expect(result).toEqual({ ...mockDocument, ...dto });
    });
  });

  describe('remove', () => {
    it('should call service to remove document', async () => {
      mockDocumentsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1', mockRequest);
      expect(service.remove).toHaveBeenCalledWith(
        '1',
        'user1',
        UserRole.EDITOR,
      );
      expect(result).toBeUndefined();
    });
  });
});
