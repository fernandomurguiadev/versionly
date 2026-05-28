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
exports.FoldersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../integrations/prisma/prisma.service");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
let FoldersService = class FoldersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listFolders(userId, projectId, search, page, limit, sortBy, sortOrder) {
        const project = await this.getProjectWithAccess(userId, projectId, [
            client_1.WorkspaceRole.viewer,
            client_1.WorkspaceRole.editor,
            client_1.WorkspaceRole.admin,
        ]);
        const pageValue = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
        const limitValue = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 100) : 20;
        const order = sortOrder === 'asc' ? 'asc' : 'desc';
        const allowedSort = new Set(['createdAt', 'updatedAt', 'name']);
        const sortKey = allowedSort.has(sortBy ?? '') ? sortBy : 'createdAt';
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
    async createFolder(userId, projectId, dto) {
        const project = await this.getProjectWithAccess(userId, projectId, [
            client_1.WorkspaceRole.editor,
            client_1.WorkspaceRole.admin,
        ]);
        return this.prisma.folder.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                projectId: project.id,
                name: dto.name,
            },
        });
    }
    async getFolder(userId, folderId) {
        const folder = await this.prisma.folder.findUnique({
            where: { id: folderId },
            include: {
                project: { select: { workspaceId: true } },
                _count: { select: { documents: true } },
            },
        });
        if (!folder) {
            throw new common_1.NotFoundException('Carpeta no encontrada.');
        }
        await this.assertWorkspaceRole(userId, folder.project.workspaceId, [
            client_1.WorkspaceRole.viewer,
            client_1.WorkspaceRole.editor,
            client_1.WorkspaceRole.admin,
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
    async updateFolder(userId, folderId, dto) {
        const folder = await this.getFolderForRole(userId, folderId, [
            client_1.WorkspaceRole.editor,
            client_1.WorkspaceRole.admin,
        ]);
        return this.prisma.folder.update({
            where: { id: folder.id },
            data: { name: dto.name },
        });
    }
    async deleteFolder(userId, folderId) {
        const folder = await this.getFolderForRole(userId, folderId, [client_1.WorkspaceRole.admin]);
        await this.prisma.folder.delete({
            where: { id: folder.id },
        });
        return { deleted: true };
    }
    async getFolderForRole(userId, folderId, roles) {
        const folder = await this.prisma.folder.findUnique({
            where: { id: folderId },
            include: { project: { select: { workspaceId: true } } },
        });
        if (!folder) {
            throw new common_1.NotFoundException('Carpeta no encontrada.');
        }
        await this.assertWorkspaceRole(userId, folder.project.workspaceId, roles);
        return folder;
    }
    async getProjectWithAccess(userId, projectId, roles) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true, workspaceId: true },
        });
        if (!project) {
            throw new common_1.NotFoundException('Proyecto no encontrado.');
        }
        await this.assertWorkspaceRole(userId, project.workspaceId, roles);
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
exports.FoldersService = FoldersService;
exports.FoldersService = FoldersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FoldersService);
//# sourceMappingURL=folders.service.js.map