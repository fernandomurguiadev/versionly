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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../integrations/prisma/prisma.service");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const document_access_service_1 = require("../../common/services/document-access.service");
const EMPTY_DOC = { type: 'doc', content: [] };
let DocumentsService = class DocumentsService {
    constructor(prisma, accessService) {
        this.prisma = prisma;
        this.accessService = accessService;
    }
    async listDocuments(userId, folderId, search, page, limit, sortBy, sortOrder) {
        await this.assertFolderAccess(userId, folderId, [client_1.WorkspaceRole.viewer, client_1.WorkspaceRole.editor, client_1.WorkspaceRole.admin]);
        const pageValue = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
        const limitValue = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 100) : 20;
        const order = sortOrder === 'asc' ? 'asc' : 'desc';
        const allowedSort = new Set(['createdAt', 'updatedAt', 'title']);
        const sortKey = allowedSort.has(sortBy ?? '') ? sortBy : 'updatedAt';
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
        let documents = [];
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
        }
        catch (error) {
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
    async createDocument(userId, folderId, dto) {
        await this.assertFolderAccess(userId, folderId, [client_1.WorkspaceRole.editor, client_1.WorkspaceRole.admin]);
        const docId = (0, crypto_1.randomUUID)();
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
                    id: (0, crypto_1.randomUUID)(),
                    documentId: docId,
                    content: EMPTY_DOC,
                    updatedBy: userId,
                },
            }),
            this.prisma.documentMember.create({
                data: {
                    id: (0, crypto_1.randomUUID)(),
                    documentId: docId,
                    userId,
                    role: client_1.DocumentRole.editor,
                    canViewHistory: true,
                },
            }),
        ]);
        return this.prisma.document.findUnique({
            where: { id: docId },
        });
    }
    async getDocument(userId, docId) {
        const access = await this.accessService.getAccess(userId, docId);
        let document = null;
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
        }
        catch (error) {
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
            throw new common_1.NotFoundException('Documento no encontrado.');
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
    isMissingSharedLinksTable(error) {
        return error instanceof Error && error.message.includes('shared_links');
    }
    async getDocumentContent(userId, docId) {
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
            throw new common_1.NotFoundException('Documento no encontrado.');
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
            content: current?.content ?? EMPTY_DOC,
        };
    }
    async updateDocument(userId, docId, dto) {
        const access = await this.accessService.assertEditor(userId, docId);
        await this.assertWorkspaceRole(userId, access.workspaceId, [client_1.WorkspaceRole.editor, client_1.WorkspaceRole.admin]);
        return this.prisma.document.update({
            where: { id: docId },
            data: { title: dto.title },
        });
    }
    async deleteDocument(userId, docId, confirm) {
        if (confirm !== 'true') {
            throw new common_1.BadRequestException('Confirma la eliminación con ?confirm=true.');
        }
        const access = await this.accessService.getAccess(userId, docId);
        await this.assertWorkspaceRole(userId, access.workspaceId, [client_1.WorkspaceRole.admin]);
        await this.prisma.document.delete({ where: { id: docId } });
        return { deleted: true };
    }
    async moveDocument(userId, docId, dto) {
        const access = await this.accessService.assertEditor(userId, docId);
        const targetFolder = await this.prisma.folder.findUnique({
            where: { id: dto.folderId },
            select: {
                id: true,
                project: { select: { workspaceId: true } },
            },
        });
        if (!targetFolder) {
            throw new common_1.NotFoundException('Carpeta destino no encontrada.');
        }
        if (targetFolder.project.workspaceId !== access.workspaceId) {
            throw new common_1.ForbiddenException('La carpeta destino no pertenece al mismo workspace.');
        }
        return this.prisma.document.update({
            where: { id: docId },
            data: { folderId: targetFolder.id },
        });
    }
    async listMembers(userId, docId) {
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
    async addMember(userId, docId, dto) {
        await this.accessService.assertEditor(userId, docId);
        if (!dto.userId) {
            throw new common_1.BadRequestException('userId es requerido.');
        }
        const target = await this.prisma.user.findUnique({
            where: { id: dto.userId },
            select: { id: true },
        });
        if (!target) {
            throw new common_1.NotFoundException('Usuario no encontrado.');
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
                id: (0, crypto_1.randomUUID)(),
                documentId: docId,
                userId: dto.userId,
                role: client_1.DocumentRole.viewer,
                canViewHistory: dto.canViewHistory,
            },
        });
    }
    async updateMember(userId, docId, targetUserId, dto) {
        await this.accessService.assertEditor(userId, docId);
        const member = await this.prisma.documentMember.findFirst({
            where: { documentId: docId, userId: targetUserId },
        });
        if (!member) {
            throw new common_1.NotFoundException('Miembro no encontrado.');
        }
        return this.prisma.documentMember.update({
            where: { id: member.id },
            data: { canViewHistory: dto.canViewHistory },
        });
    }
    async removeMember(userId, docId, targetUserId) {
        await this.accessService.assertEditor(userId, docId);
        await this.prisma.documentMember.delete({
            where: { documentId_userId: { documentId: docId, userId: targetUserId } },
        });
        return { deleted: true };
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
    async assertFolderAccess(userId, folderId, roles) {
        const folder = await this.prisma.folder.findUnique({
            where: { id: folderId },
            select: {
                id: true,
                project: { select: { workspaceId: true } },
            },
        });
        if (!folder) {
            throw new common_1.NotFoundException('Carpeta no encontrada.');
        }
        await this.assertWorkspaceRole(userId, folder.project.workspaceId, roles);
        return folder;
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        document_access_service_1.DocumentAccessService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map