"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspacesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../integrations/prisma/prisma.service");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
let WorkspacesService = class WorkspacesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listWorkspaces(userId, search, page, limit, sortBy, sortOrder) {
        const pageValue = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
        const limitValue = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 100) : 20;
        const order = sortOrder === 'asc' ? 'asc' : 'desc';
        const allowedSort = new Set(['createdAt', 'updatedAt', 'name']);
        const sortKey = allowedSort.has(sortBy ?? '') ? sortBy : 'createdAt';
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
            orderBy: sortKey === 'name'
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
    async createWorkspace(userId, dto) {
        const workspaceId = (0, crypto_1.randomUUID)();
        const memberId = (0, crypto_1.randomUUID)();
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
                    role: client_1.WorkspaceRole.admin,
                },
            }),
        ]);
        return workspace;
    }
    async getWorkspace(userId, wsId) {
        await this.assertWorkspaceRole(userId, wsId, [client_1.WorkspaceRole.viewer, client_1.WorkspaceRole.editor, client_1.WorkspaceRole.admin]);
        const workspace = await this.prisma.workspace.findUnique({
            where: { id: wsId },
        });
        if (!workspace) {
            throw new common_1.NotFoundException('Workspace no encontrado.');
        }
        return workspace;
    }
    async updateWorkspace(userId, wsId, dto) {
        await this.assertWorkspaceRole(userId, wsId, [client_1.WorkspaceRole.admin]);
        return this.prisma.workspace.update({
            where: { id: wsId },
            data: { name: dto.name },
        });
    }
    async deleteWorkspace(userId, wsId) {
        await this.assertWorkspaceRole(userId, wsId, [client_1.WorkspaceRole.admin]);
        await this.prisma.workspace.delete({
            where: { id: wsId },
        });
        return { deleted: true };
    }
    async listMembers(userId, wsId, search, page, limit, sortBy, sortOrder) {
        await this.assertWorkspaceRole(userId, wsId, [client_1.WorkspaceRole.viewer, client_1.WorkspaceRole.editor, client_1.WorkspaceRole.admin]);
        const pageValue = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
        const limitValue = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 100) : 20;
        const order = sortOrder === 'asc' ? 'asc' : 'desc';
        const allowedSort = new Set(['createdAt', 'email', 'fullName']);
        const sortKey = allowedSort.has(sortBy ?? '') ? sortBy : 'createdAt';
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
            orderBy: sortKey === 'createdAt'
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
    async addMember(userId, wsId, dto) {
        await this.assertWorkspaceRole(userId, wsId, [client_1.WorkspaceRole.admin]);
        const userExists = await this.prisma.user.findUnique({
            where: { id: dto.userId },
            select: { id: true },
        });
        if (!userExists) {
            throw new common_1.BadRequestException('Usuario no encontrado.');
        }
        return this.prisma.workspaceMember.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                workspaceId: wsId,
                userId: dto.userId,
                role: dto.role,
            },
        });
    }
    async updateMemberRole(userId, wsId, memberUserId, dto) {
        await this.assertWorkspaceRole(userId, wsId, [client_1.WorkspaceRole.admin]);
        return this.prisma.workspaceMember.update({
            where: {
                workspaceId_userId: { workspaceId: wsId, userId: memberUserId },
            },
            data: { role: dto.role },
        });
    }
    async removeMember(userId, wsId, memberUserId) {
        await this.assertWorkspaceRole(userId, wsId, [client_1.WorkspaceRole.admin]);
        await this.prisma.workspaceMember.delete({
            where: {
                workspaceId_userId: { workspaceId: wsId, userId: memberUserId },
            },
        });
        return { removed: true };
    }
    async activity(userId, wsId) {
        await this.assertWorkspaceRole(userId, wsId, [client_1.WorkspaceRole.viewer, client_1.WorkspaceRole.editor, client_1.WorkspaceRole.admin]);
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
    async assertWorkspaceRole(userId, wsId, roles) {
        const member = await this.prisma.workspaceMember.findFirst({
            where: { workspaceId: wsId, userId },
            select: { role: true },
        });
        if (!member || !roles.includes(member.role)) {
            throw new common_1.ForbiddenException('No tienes permisos para esta acción.');
        }
    }
};
exports.WorkspacesService = WorkspacesService;
exports.WorkspacesService = WorkspacesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkspacesService);
//# sourceMappingURL=workspaces.service.js.map