import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { UserRole } from '../users/entities/user.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DocumentStatus } from './entities/document.entity'; // Adjust if in another file

describe('DocumentsService', () => {
  let service: DocumentsService;
  let repo: jest.Mocked<Repository<Document>>;

  const mockDocument: Document = {
    id: '1',
    description: 'A test document',
    filename: 'test.pdf',
    originalName: 'test.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    path: '/uploads/test.pdf',
    uploadedById: 'user1',
    uploadedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: DocumentStatus.PENDING,
  };

  const mockFile: Express.Multer.File = {
    originalname: 'test.pdf',
    mimetype: 'application/pdf',
    size: 1024,
    filename: 'test.pdf',
    path: '/uploads/test.pdf',
    buffer: null,
    stream: null,
    destination: '',
    fieldname: '',
    encoding: '',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: getRepositoryToken(Document),
          useValue: {
            create: jest.fn().mockReturnValue(mockDocument),
            save: jest.fn().mockResolvedValue(mockDocument),
            find: jest.fn().mockResolvedValue([mockDocument]),
            findOne: jest.fn().mockResolvedValue(mockDocument),
            update: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    repo = module.get(getRepositoryToken(Document));
  });

  describe('create', () => {
    it('should create and save a document', async () => {
      const dto: CreateDocumentDto = {
        description: 'desc',
      };
      const result = await service.create(dto, mockFile, 'user1');
      expect(repo.create).toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalledWith(mockDocument);
      expect(result).toEqual(mockDocument);
    });
  });

  describe('findAll', () => {
    it('should return all documents for ADMIN', async () => {
      await service.findAll(undefined, UserRole.ADMIN);
      expect(repo.find).toHaveBeenCalledWith({ relations: ['uploadedBy'] });
    });

    it('should return user documents for non-admin', async () => {
      await service.findAll('user1', UserRole.VIEWER);
      expect(repo.find).toHaveBeenCalledWith({
        where: { uploadedById: 'user1' },
        relations: ['uploadedBy'],
      });
    });
  });

  describe('findOne', () => {
    it('should return document if user has access', async () => {
      const result = await service.findOne('1', 'user1', UserRole.EDITOR);
      expect(result).toEqual(mockDocument);
    });

    it('should throw NotFoundException if doc not found', async () => {
      repo.findOne.mockResolvedValueOnce(null);
      await expect(
        service.findOne('2', 'user1', UserRole.ADMIN),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not owner and not admin', async () => {
      repo.findOne.mockResolvedValueOnce({
        ...mockDocument,
        uploadedById: 'otherUser',
      });
      await expect(
        service.findOne('1', 'user1', UserRole.VIEWER),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should allow admin to update', async () => {
      const dto: UpdateDocumentDto = { status: DocumentStatus.PROCESSING };
      const result = await service.update('1', dto, 'user1', UserRole.ADMIN);
      expect(repo.update).toHaveBeenCalledWith('1', dto);
      expect(result).toEqual(mockDocument);
    });

    it('should deny viewer role from updating', async () => {
      await expect(
        service.update('1', {}, 'user1', UserRole.VIEWER),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should allow editor to delete', async () => {
      await service.remove('1', 'user1', UserRole.EDITOR);
      expect(repo.delete).toHaveBeenCalledWith('1');
    });

    it('should deny viewer role from deleting', async () => {
      await expect(
        service.remove('1', 'user1', UserRole.VIEWER),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateStatus', () => {
    it('should update document status to completed', async () => {
      repo.findOne.mockResolvedValueOnce({
        ...mockDocument,
        status: DocumentStatus.COMPLETED,
      });
      const result = await service.updateStatus('1', DocumentStatus.COMPLETED);
      expect(repo.update).toHaveBeenCalledWith('1', {
        status: DocumentStatus.COMPLETED,
      });
      expect(result.status).toEqual(DocumentStatus.COMPLETED);
    });

    it('should update status to failed', async () => {
      repo.findOne.mockResolvedValueOnce({
        ...mockDocument,
        status: DocumentStatus.FAILED,
      });
      const result = await service.updateStatus('1', DocumentStatus.FAILED);
      expect(repo.update).toHaveBeenCalledWith('1', {
        status: DocumentStatus.FAILED,
      });
      expect(result.status).toEqual(DocumentStatus.FAILED);
    });

    it('should throw NotFoundException if doc not found after update', async () => {
      repo.findOne.mockResolvedValueOnce(null);
      await expect(
        service.updateStatus('1', DocumentStatus.PROCESSING),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
