import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class DocumentSettingsDto {
  @ApiProperty({ enum: ['serif', 'sans', 'mono'], required: false })
  @IsOptional()
  @IsIn(['serif', 'sans', 'mono'])
  fontFamily?: 'serif' | 'sans' | 'mono';

  @ApiProperty({ enum: ['10pt', '11pt', '12pt'], required: false })
  @IsOptional()
  @IsIn(['10pt', '11pt', '12pt'])
  fontSize?: '10pt' | '11pt' | '12pt';

  @ApiProperty({ enum: [1.5, 1.75, 2.0], required: false })
  @IsOptional()
  @IsIn([1.5, 1.75, 2.0])
  lineHeight?: 1.5 | 1.75 | 2.0;

  @ApiProperty({ enum: ['compact', 'standard', 'wide'], required: false })
  @IsOptional()
  @IsIn(['compact', 'standard', 'wide'])
  pageWidth?: 'compact' | 'standard' | 'wide';
}

export type DocumentSettings = Required<DocumentSettingsDto>;

export const DEFAULT_SETTINGS: DocumentSettings = {
  fontFamily: 'serif',
  fontSize: '11pt',
  lineHeight: 1.75,
  pageWidth: 'standard',
};
