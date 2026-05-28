import { BadRequestException, Injectable } from '@nestjs/common';
import { ImportDocumentDto } from './dto/import-document.dto';
import { DocumentsService } from '../documents/documents.service';
import { VersionsService } from '../versions/versions.service';

const EMPTY_DOC = { type: 'doc', content: [] };

@Injectable()
export class ImportsService {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly versionsService: VersionsService,
  ) {}

  async importDocument(userId: string, folderId: string, dto: ImportDocumentDto) {
    const { content, warnings } = this.parseContent(dto);
    const title = dto.title?.trim() || this.suggestTitle(dto.filename);

    const document = await this.documentsService.createDocument(userId, folderId, { title });
    if (!document) {
      throw new BadRequestException('No se pudo crear el documento.');
    }
    const version = await this.versionsService.createImportVersion(userId, document.id, {
      name: 'Importación inicial',
      comment: `Importado desde ${dto.filename}`,
      content,
      importWarnings: warnings,
      markAsCurrent: true,
    });

    return {
      documentId: document.id,
      versionId: version.id,
      warnings,
    };
  }

  private parseContent(dto: ImportDocumentDto) {
    const warnings: Record<string, unknown>[] = [];
    const buffer = Buffer.from(dto.contentBase64, 'base64');
    if (buffer.length === 0) {
      throw new BadRequestException('Archivo vacío.');
    }

    const contentText = buffer.toString('utf8');
    if (dto.mimeType === 'application/json' || dto.filename.toLowerCase().endsWith('.json')) {
      try {
        const parsed = JSON.parse(contentText);
        return {
          content: typeof parsed === 'object' && parsed ? parsed : EMPTY_DOC,
          warnings,
        };
      } catch (error) {
        warnings.push({ code: 'INVALID_JSON', message: 'No se pudo interpretar el JSON.' });
      }
    }

    warnings.push({ code: 'IMPORT_PLACEHOLDER', message: 'Contenido convertido de forma básica.' });
    return {
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: contentText.slice(0, 2000),
              },
            ],
          },
        ],
      },
      warnings,
    };
  }

  private suggestTitle(filename: string) {
    const stripped = filename.replace(/\.[^/.]+$/, '').trim();
    return stripped || 'Documento importado';
  }
}
