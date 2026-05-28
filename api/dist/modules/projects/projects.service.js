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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../integrations/prisma/prisma.service");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
let ProjectsService = class ProjectsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listProjects(userId, wsId, search, page, limit, sortBy, sortOrder) {
        await this.assertWorkspaceRole(userId, wsId, [client_1.WorkspaceRole.viewer, client_1.WorkspaceRole.editor, client_1.WorkspaceRole.admin]);
        const pageValue = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
        const limitValue = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 100) : 20;
        const order = sortOrder === 'asc' ? 'asc' : 'desc';
        const allowedSort = new Set(['createdAt', 'updatedAt', 'name']);
        const sortKey = allowedSort.has(sortBy ?? '') ? sortBy : 'createdAt';
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
    async createProject(userId, wsId, dto) {
        await this.assertWorkspaceRole(userId, wsId, [client_1.WorkspaceRole.admin]);
        return this.prisma.project.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                workspaceId: wsId,
                name: dto.name,
            },
        });
    }
    async getProject(userId, projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                _count: {
                    select: { folders: true },
                },
            },
        });
        if (!project) {
            throw new common_1.NotFoundException('Proyecto no encontrado.');
        }
        await this.assertWorkspaceRole(userId, project.workspaceId, [
            client_1.WorkspaceRole.viewer,
            client_1.WorkspaceRole.editor,
            client_1.WorkspaceRole.admin,
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
    async updateProject(userId, projectId, dto) {
        const project = await this.getProjectForAdmin(userId, projectId);
        return this.prisma.project.update({
            where: { id: project.id },
            data: { name: dto.name },
        });
    }
    async deleteProject(userId, projectId) {
        const project = await this.getProjectForAdmin(userId, projectId);
        await this.prisma.project.delete({
            where: { id: project.id },
        });
        return { deleted: true };
    }
    async getProjectForAdmin(userId, projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true, workspaceId: true },
        });
        if (!project) {
            throw new common_1.NotFoundException('Proyecto no encontrado.');
        }
        await this.assertWorkspaceRole(userId, project.workspaceId, [client_1.WorkspaceRole.admin]);
        return project;
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
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map