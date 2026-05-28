import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { WorkspaceRole } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PaginatedResponse } from '../../common/types/paginated-response.type';

@Injectable()
export class FoldersService {
  constructor(private readonly prisma: PrismaService) {}

  async listFolders(
    userId: string,
    projectId: string,
    search?: string,
    page?: string,
    limit?: string,
    sortBy?: string,
    sortOrder?: string,
  ): Promise<
    PaginatedResponse<{
      id: string;
      projectId: string;
      name: string;
      documentCount: number;
      createdAt: Date;
      updatedAt: Date;
    }>
  > {
    const project = await this.getProjectWithAccess(userId, projectId, [
      WorkspaceRole.viewer,
      WorkspaceRole.editor,
      WorkspaceRole.admin,
    ]);
    const pageValue = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
    const limitValue = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 100) : 20;
    const order: 'asc' | 'desc' = sortOrder === 'asc' ? 'asc' : 'desc';
    const allowedSort = new Set(['createdAt', 'updatedAt', 'name']);
    const sortKey = allowedSort.has(sortBy ?? '') ? (sortBy as 'createdAt' | 'updatedAt' | 'name') : 'createdAt';
    const where = {
      projectId: project.id,
      ...(search
        ? {
            name: {
              contains: search,
            },
          }
        : {}),
    };
    const total = await this.prisma.folder.count({ where });

    const folders = await this.prisma.folder.findMany({
      where,
      include: {
        _count: {
          select: { documents: true },
        },
      },
      orderBy: { [sortKey]: order },
      skip: (pageValue - 1) * limitValue,
      take: limitValue,
    });

    return {
      data: folders.map((folder) => ({
        id: folder.id,
        projectId: folder.projectId,
        name: folder.name,
        documentCount: folder._count.documents,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
      })),
      meta: {
        total,
        page: pageValue,
        limit: limitValue,
        totalPages: Math.ceil(total / limitValue),
      },
    };
  }

  async createFolder(userId: string, projectId: string, dto: CreateFolderDto) {
    const project = await this.getProjectWithAccess(userId, projectId, [
      WorkspaceRole.editor,
      WorkspaceRole.admin,
    ]);

    return this.prisma.folder.create({
      data: {
        id: randomUUID(),
        projectId: project.id,
        name: dto.name,
      },
    });
  }

  async getFolder(userId: string, folderId: string) {
    const folder = await this.prisma.folder.findUnique({
      where: { id: folderId },
      include: {
        project: { select: { workspaceId: true } },
        _count: { select: { documents: true } },
      },
    });

    if (!folder) {
      throw new NotFoundException('Carpeta no encontrada.');
    }

    await this.assertWorkspaceRole(userId, folder.project.workspaceId, [
      WorkspaceRole.viewer,
      WorkspaceRole.editor,
      WorkspaceRole.admin,
    ]);

    return {
      id: folder.id,
      projectId: folder.projectId,
      name: folder.name,
      documentCount: folder._count.documents,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
    };
  }

  async updateFolder(userId: string, folderId: string, dto: UpdateFolderDto) {
    const folder = await this.getFolderForRole(userId, folderId, [
      WorkspaceRole.editor,
      WorkspaceRole.admin,
    ]);

    return this.prisma.folder.update({
      where: { id: folder.id },
      data: { name: dto.name },
    });
  }

  async deleteFolder(userId: string, folderId: string) {
    const folder = await this.getFolderForRole(userId, folderId, [WorkspaceRole.admin]);
    await this.prisma.folder.delete({
      where: { id: folder.id },
    });
    return { deleted: true };
  }

  private async getFolderForRole(userId: string, folderId: string, roles: WorkspaceRole[]) {
    const folder = await this.prisma.folder.findUnique({
      where: { id: folderId },
      include: { project: { select: { workspaceId: true } } },
    });

    if (!folder) {
      throw new NotFoundException('Carpeta no encontrada.');
    }

    await this.assertWorkspaceRole(userId, folder.project.workspaceId, roles);
    return folder;
  }

  private async getProjectWithAccess(userId: string, projectId: string, roles: WorkspaceRole[]) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, workspaceId: true },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado.');
    }

    await this.assertWorkspaceRole(userId, project.workspaceId, roles);
    return project;
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
}
