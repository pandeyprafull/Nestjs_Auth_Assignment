import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({ example: 'Document description', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
