import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { SaveDraftDto } from './dto/save-draft.dto';
import { DocumentAccessService } from '../../common/services/document-access.service';
import { randomUUID } from 'crypto';

@Injectable()
export class DraftsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: DocumentAccessService,
  ) {}

  async getDraft(userId: string, docId: string) {
    await this.accessService.assertEditor(userId, docId);
    return this.prisma.documentDraft.findUnique({
      where: { documentId: docId },
    });
  }

  async saveDraft(userId: string, docId: string, dto: SaveDraftDto) {
    await this.accessService.assertEditor(userId, docId);

    return this.prisma.documentDraft.upsert({
      where: { documentId: docId },
      update: {
        content: dto.content as Prisma.InputJsonValue,
        updatedBy: userId,
      },
      create: {
        id: randomUUID(),
        documentId: docId,
        content: dto.content as Prisma.InputJsonValue,
        updatedBy: userId,
      },
    });
  }
}
