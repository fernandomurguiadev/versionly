import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { CreateVersionDto } from './dto/create-version.dto';
import { DocumentAccessService } from '../../common/services/document-access.service';
import { DocumentRole, Prisma, VersionSource, WorkspaceRole } from '@prisma/client';
import { randomUUID } from 'crypto';
import { NotificationsService } from '../notifications/notifications.service';
import { PaginatedResponse } from '../../common/types/paginated-response.type';

const EMPTY_DOC = { type: 'doc', content: [] };

@Injectable()
export class VersionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: DocumentAccessService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async listVersions(
    userId: string,
    docId: string,
    page?: string,
    limit?: string,
    sortBy?: string,
    sortOrder?: string,
  ): Promise<
    PaginatedResponse<{
      id: string;
      documentId: string;
      name: string;
      comment: string | null;
      source: VersionSource;
      isCurrent: boolean;
      createdBy: { id: string; fullName: string | null } | null;
      basedOnVersionId: string | null;
      createdAt: Date;
    }>
  > {
    const access = await this.accessService.getAccess(userId, docId);
    if (access.role === DocumentRole.viewer && !access.canViewHistory) {
      throw new ForbiddenException('No tienes permisos para ver el historial.');
    }
    const pageValue = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
    const limitValue = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 100) : 20;
    const order: 'asc' | 'desc' = sortOrder === 'asc' ? 'asc' : 'desc';
    const allowedSort = new Set(['createdAt', 'name']);
    const sortKey = allowedSort.has(sortBy ?? '') ? (sortBy as 'createdAt' | 'name') : 'createdAt';
    const where = { documentId: docId };
    const total = await this.prisma.documentVersion.count({ where });

    const versions = await this.prisma.documentVersion.findMany({
      where,
      select: {
        id: true,
        documentId: true,
        name: true,
        comment: true,
        source: true,
        isCurrent: true,
        basedOnVersionId: true,
        createdAt: true,
        // content excluido intencionalmente — el listado no necesita el payload completo
        createdByUser: { select: { id: true, fullName: true } },
      },
      orderBy: { [sortKey]: order },
      skip: (pageValue - 1) * limitValue,
      take: limitValue,
    });

    return {
      data: versions.map((version) => ({
        id: version.id,
        documentId: version.documentId,
        name: version.name,
        comment: version.comment,
        source: version.source,
        isCurrent: version.isCurrent,
        createdBy: version.createdByUser,
        basedOnVersionId: version.basedOnVersionId,
        createdAt: version.createdAt,
      })),
      meta: {
        total,
        page: pageValue,
        limit: limitValue,
        totalPages: Math.ceil(total / limitValue),
      },
    };
  }

  async createVersion(userId: string, docId: string, dto: CreateVersionDto) {
    await this.accessService.assertEditor(userId, docId);
    const draft = await this.prisma.documentDraft.findUnique({
      where: { documentId: docId },
    });

    const content = ((draft?.content as Record<string, unknown>) ?? EMPTY_DOC) as Prisma.InputJsonValue;

    return this.prisma.$transaction(async (tx) => {
      if (dto.markAsCurrent) {
        await tx.documentVersion.updateMany({
          where: { documentId: docId, isCurrent: true },
          data: { isCurrent: false },
        });
      }

      const version = await tx.documentVersion.create({
        data: {
          id: randomUUID(),
          documentId: docId,
          name: dto.name,
          comment: dto.comment,
          content,
          createdBy: userId,
          basedOnVersionId: dto.basedOnVersionId,
          source: VersionSource.manual,
          isCurrent: dto.markAsCurrent ?? false,
        },
        include: { createdByUser: { select: { id: true, fullName: true } } },
      });

      if (version.isCurrent) {
        await this.notifyCurrentVersion(docId, userId, version.id);
      }

      return version;
    });
  }

  async createImportVersion(
    userId: string,
    docId: string,
    payload: {
      name: string;
      comment?: string;
      content: Record<string, unknown>;
      importWarnings: Record<string, unknown>[];
      markAsCurrent?: boolean;
    },
  ) {
    await this.accessService.assertEditor(userId, docId);

    return this.prisma.$transaction(async (tx) => {
      if (payload.markAsCurrent) {
        await tx.documentVersion.updateMany({
          where: { documentId: docId, isCurrent: true },
          data: { isCurrent: false },
        });
      }

      const version = await tx.documentVersion.create({
        data: {
          id: randomUUID(),
          documentId: docId,
          name: payload.name,
          comment: payload.comment,
          content: payload.content as Prisma.InputJsonValue,
          createdBy: userId,
          source: VersionSource.import,
          importWarnings: payload.importWarnings as Prisma.InputJsonValue,
          isCurrent: payload.markAsCurrent ?? false,
        },
        include: { createdByUser: { select: { id: true, fullName: true } } },
      });

      if (version.isCurrent) {
        await this.notifyCurrentVersion(docId, userId, version.id);
      }

      return version;
    });
  }

  async getVersion(userId: string, versionId: string) {
    const version = await this.prisma.documentVersion.findUnique({
      where: { id: versionId },
      include: { createdByUser: { select: { id: true, fullName: true } } },
    });

    if (!version) {
      throw new NotFoundException('Versión no encontrada.');
    }

    const access = await this.accessService.getAccess(userId, version.documentId);
    if (access.role === DocumentRole.viewer && !access.canViewHistory) {
      throw new ForbiddenException('No tienes permisos para ver el historial.');
    }

    return {
      id: version.id,
      documentId: version.documentId,
      name: version.name,
      comment: version.comment,
      source: version.source,
      isCurrent: version.isCurrent,
      createdBy: version.createdByUser,
      basedOnVersionId: version.basedOnVersionId,
      mergeFromA: version.mergeFromA,
      mergeFromB: version.mergeFromB,
      importWarnings: version.importWarnings as Record<string, unknown>[] | null,
      content: version.content as Record<string, unknown>,
      createdAt: version.createdAt,
    };
  }

  async setCurrent(userId: string, versionId: string) {
    const version = await this.prisma.documentVersion.findUnique({
      where: { id: versionId },
      select: { id: true, documentId: true },
    });

    if (!version) {
      throw new NotFoundException('Versión no encontrada.');
    }

    await this.accessService.assertEditor(userId, version.documentId);

    await this.prisma.$transaction([
      this.prisma.documentVersion.updateMany({
        where: { documentId: version.documentId, isCurrent: true },
        data: { isCurrent: false },
      }),
      this.prisma.documentVersion.update({
        where: { id: version.id },
        data: { isCurrent: true },
      }),
    ]);

    await this.notifyCurrentVersion(version.documentId, userId, version.id);
    return { updated: true };
  }

  async deleteVersion(userId: string, versionId: string) {
    const version = await this.prisma.documentVersion.findUnique({
      where: { id: versionId },
      select: { id: true, documentId: true, createdBy: true, isCurrent: true },
    });

    if (!version) {
      throw new NotFoundException('Versión no encontrada.');
    }

    if (version.isCurrent) {
      throw new BadRequestException('No puedes eliminar la versión actual.');
    }

    const access = await this.accessService.assertEditor(userId, version.documentId);
    const isAdmin = await this.isWorkspaceAdmin(userId, access.workspaceId);

    if (!isAdmin && version.createdBy !== userId) {
      throw new ForbiddenException('No puedes eliminar esta versión.');
    }

    await this.prisma.documentVersion.delete({ where: { id: version.id } });
    return { deleted: true };
  }

  private async notifyCurrentVersion(docId: string, actorId: string, versionId: string) {
    const members = await this.prisma.documentMember.findMany({
      where: { documentId: docId },
      select: { userId: true },
    });

    await Promise.all(
      members.map((member) =>
        this.notificationsService.create({
          userId: member.userId,
          type: 'new_current_version',
          documentId: docId,
          relatedUserId: actorId,
          payload: { versionId },
        }),
      ),
    );
  }

  private async isWorkspaceAdmin(userId: string, workspaceId: string) {
    const member = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId, userId },
      select: { role: true },
    });
    return member?.role === WorkspaceRole.admin;
  }
}
