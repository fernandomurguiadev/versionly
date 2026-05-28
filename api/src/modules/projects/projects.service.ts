import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { WorkspaceRole } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PaginatedResponse } from '../../common/types/paginated-response.type';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async listProjects(
    userId: string,
    wsId: string,
    search?: string,
    page?: string,
    limit?: string,
    sortBy?: string,
    sortOrder?: string,
  ): Promise<
    PaginatedResponse<{
      id: string;
      workspaceId: string;
      name: string;
      folderCount: number;
      createdAt: Date;
      updatedAt: Date;
    }>
  > {
    await this.assertWorkspaceRole(userId, wsId, [WorkspaceRole.viewer, WorkspaceRole.editor, WorkspaceRole.admin]);
    const pageValue = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
    const limitValue = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 100) : 20;
    const order: 'asc' | 'desc' = sortOrder === 'asc' ? 'asc' : 'desc';
    const allowedSort = new Set(['createdAt', 'updatedAt', 'name']);
    const sortKey = allowedSort.has(sortBy ?? '') ? (sortBy as 'createdAt' | 'updatedAt' | 'name') : 'createdAt';
    const where = {
      workspaceId: wsId,
      ...(search
        ? {
            name: {
              contains: search,
            },
          }
        : {}),
    };
    const total = await this.prisma.project.count({ where });

    const projects = await this.prisma.project.findMany({
      where,
      include: {
        _count: {
          select: { folders: true },
        },
      },
      orderBy: { [sortKey]: order },
      skip: (pageValue - 1) * limitValue,
      take: limitValue,
    });

    return {
      data: projects.map((project) => ({
        id: project.id,
        workspaceId: project.workspaceId,
        name: project.name,
        folderCount: project._count.folders,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      })),
      meta: {
        total,
        page: pageValue,
        limit: limitValue,
        totalPages: Math.ceil(total / limitValue),
      },
    };
  }

  async createProject(userId: string, wsId: string, dto: CreateProjectDto) {
    await this.assertWorkspaceRole(userId, wsId, [WorkspaceRole.admin]);

    return this.prisma.project.create({
      data: {
        id: randomUUID(),
        workspaceId: wsId,
        name: dto.name,
      },
    });
  }

  async getProject(userId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        _count: {
          select: { folders: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado.');
    }

    await this.assertWorkspaceRole(userId, project.workspaceId, [
      WorkspaceRole.viewer,
      WorkspaceRole.editor,
      WorkspaceRole.admin,
    ]);

    return {
      id: project.id,
      workspaceId: project.workspaceId,
      name: project.name,
      folderCount: project._count.folders,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  async updateProject(userId: string, projectId: string, dto: UpdateProjectDto) {
    const project = await this.getProjectForAdmin(userId, projectId);
    return this.prisma.project.update({
      where: { id: project.id },
      data: { name: dto.name },
    });
  }

  async deleteProject(userId: string, projectId: string) {
    const project = await this.getProjectForAdmin(userId, projectId);
    await this.prisma.project.delete({
      where: { id: project.id },
    });
    return { deleted: true };
  }

  private async getProjectForAdmin(userId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, workspaceId: true },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado.');
    }

    await this.assertWorkspaceRole(userId, project.workspaceId, [WorkspaceRole.admin]);
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
