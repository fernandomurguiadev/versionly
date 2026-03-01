import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { DocumentAccessService } from '../../common/services/document-access.service';
import { DocumentRole } from '@prisma/client';

@Injectable()
export class DiffService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: DocumentAccessService,
  ) {}

  async compute(userId: string, versionAId: string, versionBId: string) {
    const [versionA, versionB] = await Promise.all([
      this.prisma.documentVersion.findUnique({
        where: { id: versionAId },
        include: { createdByUser: { select: { id: true, fullName: true } } },
      }),
      this.prisma.documentVersion.findUnique({
        where: { id: versionBId },
        include: { createdByUser: { select: { id: true, fullName: true } } },
      }),
    ]);

    if (!versionA || !versionB) {
      throw new NotFoundException('Versión no encontrada.');
    }

    const access = await this.accessService.getAccess(userId, versionA.documentId);
    if (access.role === DocumentRole.viewer && !access.canViewHistory) {
      throw new ForbiddenException('No tienes permisos para ver el historial.');
    }

    if (versionA.documentId !== versionB.documentId) {
      throw new ForbiddenException('Las versiones no pertenecen al mismo documento.');
    }

    const textA = JSON.stringify(versionA.content ?? {});
    const textB = JSON.stringify(versionB.content ?? {});

    let added = 0;
    let removed = 0;
    let unchanged = 0;
    let changes: Array<{
      type: 'equal' | 'insert' | 'delete' | 'replace';
      nodeType: string;
      level: number | null;
      a: string | null;
      b: string | null;
    }> = [];

    if (textA === textB) {
      unchanged = textA.length;
      changes = [{ type: 'equal', nodeType: 'text', level: null, a: textA, b: textB }];
    } else {
      removed = textA.length;
      added = textB.length;
      changes = [{ type: 'replace', nodeType: 'text', level: null, a: textA, b: textB }];
    }

    return {
      versionA: {
        id: versionA.id,
        documentId: versionA.documentId,
        name: versionA.name,
        comment: versionA.comment,
        source: versionA.source,
        isCurrent: versionA.isCurrent,
        createdBy: versionA.createdByUser,
        basedOnVersionId: versionA.basedOnVersionId,
        createdAt: versionA.createdAt,
      },
      versionB: {
        id: versionB.id,
        documentId: versionB.documentId,
        name: versionB.name,
        comment: versionB.comment,
        source: versionB.source,
        isCurrent: versionB.isCurrent,
        createdBy: versionB.createdByUser,
        basedOnVersionId: versionB.basedOnVersionId,
        createdAt: versionB.createdAt,
      },
      summary: {
        added,
        removed,
        modified: Math.min(added, removed),
        unchanged,
      },
      changes,
    };
  }
}
