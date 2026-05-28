import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { WorkspaceRole } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PaginatedResponse } from '../../common/types/paginated-response.type';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async listWorkspaces(
    userId: string,
    search?: string,
    page?: string,
    limit?: string,
    sortBy?: string,
    sortOrder?: string,
  ): Promise<PaginatedResponse<{ id: string; name: string; role: WorkspaceRole; createdAt: Date; updatedAt: Date }>> {
    const pageValue = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
    const limitValue = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 100) : 20;
    const order: 'asc' | 'desc' = sortOrder === 'asc' ? 'asc' : 'desc';
    const allowedSort = new Set(['createdAt', 'updatedAt', 'name']);
    const sortKey = allowedSort.has(sortBy ?? '') ? (sortBy as 'createdAt' | 'updatedAt' | 'name') : 'createdAt';
    const where = {
      userId,
      ...(search
        ? {
            workspace: {
              name: { contains: search },
            },
          }
        : {}),
    };
    const total = await this.prisma.workspaceMember.count({ where });
    const memberships = await this.prisma.workspaceMember.findMany({
      where,
      include: { workspace: true },
      orderBy:
        sortKey === 'name'
          ? { workspace: { name: order } }
          : { workspace: { [sortKey]: order } },
      skip: (pageValue - 1) * limitValue,
      take: limitValue,
    });

    return {
      data: memberships.map((member) => ({
        id: member.workspace.id,
        name: member.workspace.name,
        role: member.role,
        createdAt: member.workspace.createdAt,
        updatedAt: member.workspace.updatedAt,
      })),
      meta: {
        total,
        page: pageValue,
        limit: limitValue,
        totalPages: Math.ceil(total / limitValue),
      },
    };
  }

  async createWorkspace(userId: string, dto: CreateWorkspaceDto) {
    const workspaceId = randomUUID();
    const memberId = randomUUID();

    const [workspace] = await this.prisma.$transaction([
      this.prisma.workspace.create({
        data: {
          id: workspaceId,
          name: dto.name,
          createdBy: userId,
        },
      }),
      this.prisma.workspaceMember.create({
        data: {
          id: memberId,
          workspaceId,
          userId,
          role: WorkspaceRole.admin,
        },
      }),
    ]);

    return workspace;
  }

  async getWorkspace(userId: string, wsId: string) {
    await this.assertWorkspaceRole(userId, wsId, [WorkspaceRole.viewer, WorkspaceRole.editor, WorkspaceRole.admin]);
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: wsId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace no encontrado.');
    }

    return workspace;
  }

  async updateWorkspace(userId: string, wsId: string, dto: UpdateWorkspaceDto) {
    await this.assertWorkspaceRole(userId, wsId, [WorkspaceRole.admin]);
    return this.prisma.workspace.update({
      where: { id: wsId },
      data: { name: dto.name },
    });
  }

  async deleteWorkspace(userId: string, wsId: string) {
    await this.assertWorkspaceRole(userId, wsId, [WorkspaceRole.admin]);
    await this.prisma.workspace.delete({
      where: { id: wsId },
    });
    return { deleted: true };
  }

  async listMembers(
    userId: string,
    wsId: string,
    search?: string,
    page?: string,
    limit?: string,
    sortBy?: string,
    sortOrder?: string,
  ): Promise<
    PaginatedResponse<{
      userId: string;
      role: WorkspaceRole;
      createdAt: Date;
      user: { id: string; email: string; fullName: string | null };
    }>
  > {
    await this.assertWorkspaceRole(userId, wsId, [WorkspaceRole.viewer, WorkspaceRole.editor, WorkspaceRole.admin]);
    const pageValue = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
    const limitValue = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 100) : 20;
    const order: 'asc' | 'desc' = sortOrder === 'asc' ? 'asc' : 'desc';
    const allowedSort = new Set(['createdAt', 'email', 'fullName']);
    const sortKey = allowedSort.has(sortBy ?? '') ? (sortBy as 'createdAt' | 'email' | 'fullName') : 'createdAt';
    const where = {
      workspaceId: wsId,
      ...(search
        ? {
            user: {
              OR: [{ email: { contains: search } }, { fullName: { contains: search } }],
            },
          }
        : {}),
    };
    const total = await this.prisma.workspaceMember.count({ where });
    const members = await this.prisma.workspaceMember.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
      orderBy:
        sortKey === 'createdAt'
          ? { createdAt: order }
          : {
              user: { [sortKey]: order },
            },
      skip: (pageValue - 1) * limitValue,
      take: limitValue,
    });

    return {
      data: members.map((member) => ({
        userId: member.userId,
        role: member.role,
        createdAt: member.createdAt,
        user: member.user,
      })),
      meta: {
        total,
        page: pageValue,
        limit: limitValue,
        totalPages: Math.ceil(total / limitValue),
      },
    };
  }

  async addMember(userId: string, wsId: string, dto: AddMemberDto) {
    await this.assertWorkspaceRole(userId, wsId, [WorkspaceRole.admin]);
    const userExists = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { id: true },
    });

    if (!userExists) {
      throw new BadRequestException('Usuario no encontrado.');
    }

    return this.prisma.workspaceMember.create({
      data: {
        id: randomUUID(),
        workspaceId: wsId,
        userId: dto.userId,
        role: dto.role,
      },
    });
  }

  async updateMemberRole(userId: string, wsId: string, memberUserId: string, dto: UpdateMemberRoleDto) {
    await this.assertWorkspaceRole(userId, wsId, [WorkspaceRole.admin]);
    return this.prisma.workspaceMember.update({
      where: {
        workspaceId_userId: { workspaceId: wsId, userId: memberUserId },
      },
      data: { role: dto.role },
    });
  }

  async removeMember(userId: string, wsId: string, memberUserId: string) {
    await this.assertWorkspaceRole(userId, wsId, [WorkspaceRole.admin]);
    await this.prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: { workspaceId: wsId, userId: memberUserId },
      },
    });
    return { removed: true };
  }

  async activity(userId: string, wsId: string) {
    await this.assertWorkspaceRole(userId, wsId, [WorkspaceRole.viewer, WorkspaceRole.editor, WorkspaceRole.admin]);

    return this.prisma.document.findMany({
      where: {
        folder: {
          project: {
            workspaceId: wsId,
          },
        },
      },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        createdAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });
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
