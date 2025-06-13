import { PartialType } from '@nestjs/swagger';
import { CreateDocumentDto } from './create-document.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { DocumentStatus } from '../entities/document.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {
  @ApiProperty({ enum: DocumentStatus, required: false })
  @IsEnum(DocumentStatus)
  @IsOptional()
  status?: DocumentStatus;
}
