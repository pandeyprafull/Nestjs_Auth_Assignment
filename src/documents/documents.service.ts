import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentStatus } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
  ) {}

  async create(
    createDocumentDto: CreateDocumentDto,
    file: Express.Multer.File,
    userId: string,
  ): Promise<Document> {
    const document = this.documentsRepository.create({
      ...createDocumentDto,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      uploadedById: userId,
    });
    return this.documentsRepository.save(document);
  }

  async findAll(userId?: string, userRole?: UserRole): Promise<Document[]> {
    if (userRole === UserRole.ADMIN) {
      return this.documentsRepository.find({
        relations: ['uploadedBy'],
      });
    }
    return this.documentsRepository.find({
      where: { uploadedById: userId },
      relations: ['uploadedBy'],
    });
  }

  async findOne(
    id: string,
    userId?: string,
    userRole?: UserRole,
  ): Promise<Document> {
    const document = await this.documentsRepository.findOne({
      where: { id },
      relations: ['uploadedBy'],
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    if (userRole !== UserRole.ADMIN && document.uploadedById !== userId) {
      throw new ForbiddenException('You can only access your own documents');
    }

    return document;
  }

  async update(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
    userId?: string,
    userRole?: UserRole,
  ): Promise<Document> {
    // const document = await this.findOne(id, userId, userRole);

    if (userRole !== UserRole.ADMIN && userRole !== UserRole.EDITOR) {
      throw new ForbiddenException(
        'You do not have permission to update documents',
      );
    }

    await this.documentsRepository.update(id, updateDocumentDto);
    return this.findOne(id, userId, userRole);
  }

  async remove(
    id: string,
    userId?: string,
    userRole?: UserRole,
  ): Promise<void> {
    // const document = await this.findOne(id, userId, userRole);

    if (userRole !== UserRole.ADMIN && userRole !== UserRole.EDITOR) {
      throw new ForbiddenException(
        'You do not have permission to delete documents',
      );
    }

    await this.documentsRepository.delete(id);
  }

  async updateStatus(id: string, status: DocumentStatus): Promise<Document> {
    await this.documentsRepository.update(id, { status });
    const document = await this.documentsRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return document;
  }
}
