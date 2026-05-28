import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DocumentSettings, DocumentSettingsDto, DEFAULT_SETTINGS } from './dto/document-settings.dto';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { MoveDocumentDto } from './dto/move-document.dto';
import { DocumentMemberDto } from './dto/document-member.dto';
import { DocumentRole, WorkspaceRole } from '@prisma/client';
import { randomUUID } from 'crypto';
import { DocumentAccessService } from '../../common/services/document-access.service';
import { PaginatedResponse } from '../../common/types/paginated-response.type';

const EMPTY_DOC = { type: 'doc', content: [] };

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: DocumentAccessService,
  ) {}

  async listDocuments(
    userId: string,
    folderId: string,
    search?: string,
    page?: string,
    limit?: string,
    sortBy?: string,
    sortOrder?: string,
  ): Promise<
    PaginatedResponse<{
      id: string;
      folderId: string;
      title: string;
      createdBy: string | null;
      currentVersion: {
        id: string;
        name: string;
        createdBy: { id: string; fullName: string | null } | null;
        createdAt: Date;
      } | null;
      activeLinksCount: number;
      createdAt: Date;
      updatedAt: Date;
    }>
  > {
    await this.assertFolderAccess(userId, folderId, [WorkspaceRole.viewer, WorkspaceRole.editor, WorkspaceRole.admin]);
    const pageValue = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
    const limitValue = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 100) : 20;
    const order: 'asc' | 'desc' = sortOrder === 'asc' ? 'asc' : 'desc';
    const allowedSort = new Set(['createdAt', 'updatedAt', 'title']);
    const sortKey = allowedSort.has(sortBy ?? '') ? (sortBy as 'createdAt' | 'updatedAt' | 'title') : 'updatedAt';
    const where = {
      folderId,
      ...(search
        ? {
            title: {
              contains: search,
            },
          }
        : {}),
    };
    const total = await this.prisma.document.count({ where });

    let documents: Array<{
      id: string;
      folderId: string;
      title: string;
      createdBy: string | null;
      createdAt: Date;
      updatedAt: Date;
      versions: Array<{
        id: string;
        name: string;
        createdAt: Date;
        createdByUser: { id: string; fullName: string | null } | null;
      }>;
      _count?: { sharedLinks: number };
    }> = [];

    try {
      documents = await this.prisma.document.findMany({
        where,
        include: {
          versions: {
            where: { isCurrent: true },
            select: {
              id: true,
              name: true,
              createdAt: true,
              createdByUser: { select: { id: true, fullName: true } },
            },
          },
          _count: {
            select: { sharedLinks: { where: { revokedAt: null } } },
          },
        },
        orderBy: { [sortKey]: order },
        skip: (pageValue - 1) * limitValue,
        take: limitValue,
      });
    } catch (error) {
      if (!this.isMissingSharedLinksTable(error)) {
        throw error;
      }
      documents = await this.prisma.document.findMany({
        where,
        include: {
          versions: {
            where: { isCurrent: true },
            select: {
              id: true,
              name: true,
              createdAt: true,
              createdByUser: { select: { id: true, fullName: true } },
            },
          },
        },
        orderBy: { [sortKey]: order },
        skip: (pageValue - 1) * limitValue,
        take: limitValue,
      });
    }

    return {
      data: documents.map((doc) => ({
        id: doc.id,
        folderId: doc.folderId,
        title: doc.title,
        createdBy: doc.createdBy,
        currentVersion: doc.versions[0]
          ? {
              id: doc.versions[0].id,
              name: doc.versions[0].name,
              createdBy: doc.versions[0].createdByUser,
              createdAt: doc.versions[0].createdAt,
            }
          : null,
        activeLinksCount: doc._count?.sharedLinks ?? 0,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })),
      meta: {
        total,
        page: pageValue,
        limit: limitValue,
        totalPages: Math.ceil(total / limitValue),
      },
    };
  }

  async createDocument(userId: string, folderId: string, dto: CreateDocumentDto) {
    await this.assertFolderAccess(userId, folderId, [WorkspaceRole.editor, WorkspaceRole.admin]);

    const docId = randomUUID();
    await this.prisma.$transaction([
      this.prisma.document.create({
        data: {
          id: docId,
          folderId,
          title: dto.title,
          createdBy: userId,
        },
      }),
      this.prisma.documentDraft.create({
        data: {
          id: randomUUID(),
          documentId: docId,
          content: EMPTY_DOC,
          updatedBy: userId,
        },
      }),
      this.prisma.documentMember.create({
        data: {
          id: randomUUID(),
          documentId: docId,
          userId,
          role: DocumentRole.editor,
          canViewHistory: true,
        },
      }),
    ]);

    return this.prisma.document.findUnique({
      where: { id: docId },
    });
  }

  async getDocument(userId: string, docId: string) {
    const access = await this.accessService.getAccess(userId, docId);
    let document: {
      id: string;
      folderId: string;
      title: string;
      createdBy: string | null;
      createdAt: Date;
      updatedAt: Date;
      versions: Array<{
        id: string;
        name: string;
        createdAt: Date;
        createdByUser: { id: string; fullName: string | null } | null;
      }>;
      _count?: { sharedLinks: number };
    } | null = null;

    try {
      document = await this.prisma.document.findUnique({
        where: { id: docId },
        include: {
          versions: {
            where: { isCurrent: true },
            select: {
              id: true,
              name: true,
              createdAt: true,
              createdByUser: { select: { id: true, fullName: true } },
            },
          },
          _count: {
            select: { sharedLinks: { where: { revokedAt: null } } },
          },
        },
      });
    } catch (error) {
      if (!this.isMissingSharedLinksTable(error)) {
        throw error;
      }
      document = await this.prisma.document.findUnique({
        where: { id: docId },
        include: {
          versions: {
            where: { isCurrent: true },
            select: {
              id: true,
              name: true,
              createdAt: true,
              createdByUser: { select: { id: true, fullName: true } },
            },
          },
        },
      });
    }

    if (!document) {
      throw new NotFoundException('Documento no encontrado.');
    }

    return {
      id: document.id,
      folderId: document.folderId,
      title: document.title,
      createdBy: document.createdBy,
      currentVersion: document.versions[0]
        ? {
            id: document.versions[0].id,
            name: document.versions[0].name,
            createdBy: document.versions[0].createdByUser,
            createdAt: document.versions[0].createdAt,
          }
        : null,
      activeLinksCount: document._count?.sharedLinks ?? 0,
      userRole: access.role,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }

  private isMissingSharedLinksTable(error: unknown) {
    return error instanceof Error && error.message.includes('shared_links');
  }

  async getDocumentContent(userId: string, docId: string) {
    await this.accessService.getAccess(userId, docId);
    const document = await this.prisma.document.findUnique({
      where: { id: docId },
      include: {
        versions: {
          where: { isCurrent: true },
          select: {
            id: true,
            name: true,
            createdAt: true,
            createdByUser: { select: { id: true, fullName: true } },
            content: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Documento no encontrado.');
    }

    const current = document.versions[0];

    return {
      documentId: document.id,
      currentVersion: current
        ? {
            id: current.id,
            name: current.name,
            createdBy: current.createdByUser,
            createdAt: current.createdAt,
          }
        : null,
      content: (current?.content as Record<string, unknown>) ?? EMPTY_DOC,
    };
  }

  async updateDocument(userId: string, docId: string, dto: UpdateDocumentDto) {
    const access = await this.accessService.assertEditor(userId, docId);
    await this.assertWorkspaceRole(userId, access.workspaceId, [WorkspaceRole.editor, WorkspaceRole.admin]);
    return this.prisma.document.update({
      where: { id: docId },
      data: { title: dto.title },
    });
  }

  async deleteDocument(userId: string, docId: string, confirm?: string) {
    if (confirm !== 'true') {
      throw new BadRequestException('Confirma la eliminación con ?confirm=true.');
    }
    const access = await this.accessService.getAccess(userId, docId);
    await this.assertWorkspaceRole(userId, access.workspaceId, [WorkspaceRole.admin]);
    await this.prisma.document.delete({ where: { id: docId } });
    return { deleted: true };
  }

  async moveDocument(userId: string, docId: string, dto: MoveDocumentDto) {
    const access = await this.accessService.assertEditor(userId, docId);
    const targetFolder = await this.prisma.folder.findUnique({
      where: { id: dto.folderId },
      select: {
        id: true,
        project: { select: { workspaceId: true } },
      },
    });

    if (!targetFolder) {
      throw new NotFoundException('Carpeta destino no encontrada.');
    }

    if (targetFolder.project.workspaceId !== access.workspaceId) {
      throw new ForbiddenException('La carpeta destino no pertenece al mismo workspace.');
    }

    return this.prisma.document.update({
      where: { id: docId },
      data: { folderId: targetFolder.id },
    });
  }

  async listMembers(userId: string, docId: string) {
    await this.accessService.assertEditor(userId, docId);
    const members = await this.prisma.documentMember.findMany({
      where: { documentId: docId },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return members.map((member) => ({
      userId: member.userId,
      role: member.role,
      canViewHistory: member.canViewHistory,
      user: member.user,
    }));
  }

  async addMember(userId: string, docId: string, dto: DocumentMemberDto) {
    await this.accessService.assertEditor(userId, docId);
    if (!dto.userId) {
      throw new BadRequestException('userId es requerido.');
    }
    const target = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { id: true },
    });
    if (!target) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const existing = await this.prisma.documentMember.findFirst({
      where: { documentId: docId, userId: dto.userId },
    });

    if (existing) {
      return this.prisma.documentMember.update({
        where: { id: existing.id },
        data: { canViewHistory: dto.canViewHistory },
      });
    }

    return this.prisma.documentMember.create({
      data: {
        id: randomUUID(),
        documentId: docId,
        userId: dto.userId,
        role: DocumentRole.viewer,
        canViewHistory: dto.canViewHistory,
      },
    });
  }

  async updateMember(userId: string, docId: string, targetUserId: string, dto: DocumentMemberDto) {
    await this.accessService.assertEditor(userId, docId);
    const member = await this.prisma.documentMember.findFirst({
      where: { documentId: docId, userId: targetUserId },
    });

    if (!member) {
      throw new NotFoundException('Miembro no encontrado.');
    }

    return this.prisma.documentMember.update({
      where: { id: member.id },
      data: { canViewHistory: dto.canViewHistory },
    });
  }

  async removeMember(userId: string, docId: string, targetUserId: string) {
    await this.accessService.assertEditor(userId, docId);
    await this.prisma.documentMember.delete({
      where: { documentId_userId: { documentId: docId, userId: targetUserId } },
    });
    return { deleted: true };
  }

  private async assertWorkspaceRole(userId: string, wsId: string, roles: WorkspaceRole[]) {
    const member = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId: wsId, userId },
      select: { role: true },
    });

    if (!member || !roles.includes(member.role)) {
      throw new ForbiddenException('No tienes permisos para esta acción.');
    }
  }

  // ─── Document settings ───────────────────────────────────────────────────

  async getSettings(userId: string, docId: string): Promise<DocumentSettings> {
    const access = await this.accessService.getAccess(userId, docId);
    if (!access) throw new NotFoundException('Documento no encontrado.');

    const doc = await this.prisma.document.findUnique({
      where: { id: docId },
      select: { settings: true },
    });

    return { ...DEFAULT_SETTINGS, ...(doc?.settings as Partial<DocumentSettings> ?? {}) };
  }

  async updateSettings(userId: string, docId: string, dto: DocumentSettingsDto): Promise<DocumentSettings> {
    await this.accessService.assertEditor(userId, docId);

    const current = await this.getSettings(userId, docId);
    const merged: DocumentSettings = { ...current, ...dto };

    await this.prisma.document.update({
      where: { id: docId },
      data: { settings: merged as object },
    });

    return merged;
  }

  private async assertFolderAccess(userId: string, folderId: string, roles: WorkspaceRole[]) {
    const folder = await this.prisma.folder.findUnique({
      where: { id: folderId },
      select: {
        id: true,
        project: { select: { workspaceId: true } },
      },
    });

    if (!folder) {
      throw new NotFoundException('Carpeta no encontrada.');
    }

    await this.assertWorkspaceRole(userId, folder.project.workspaceId, roles);
    return folder;
  }
}
