import { IsUUID, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIngestionJobDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  documentId: string;

  @ApiProperty({ example: {}, required: false })
  @IsObject()
  @IsOptional()
  metadata?: any;
}
