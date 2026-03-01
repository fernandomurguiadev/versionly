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
exports.VersionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../integrations/prisma/prisma.service");
const document_access_service_1 = require("../../common/services/document-access.service");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const notifications_service_1 = require("../notifications/notifications.service");
const EMPTY_DOC = { type: 'doc', content: [] };
let VersionsService = class VersionsService {
    constructor(prisma, accessService, notificationsService) {
        this.prisma = prisma;
        this.accessService = accessService;
        this.notificationsService = notificationsService;
    }
    async listVersions(userId, docId, page, limit, sortBy, sortOrder) {
        const access = await this.accessService.getAccess(userId, docId);
        if (access.role === client_1.DocumentRole.viewer && !access.canViewHistory) {
            throw new common_1.ForbiddenException('No tienes permisos para ver el historial.');
        }
        const pageValue = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
        const limitValue = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 100) : 20;
        const order = sortOrder === 'asc' ? 'asc' : 'desc';
        const allowedSort = new Set(['createdAt', 'name']);
        const sortKey = allowedSort.has(sortBy ?? '') ? sortBy : 'createdAt';
        const where = { documentId: docId };
        const total = await this.prisma.documentVersion.count({ where });
        const versions = await this.prisma.documentVersion.findMany({
            where,
            include: { createdByUser: { select: { id: true, fullName: true } } },
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
    async createVersion(userId, docId, dto) {
        await this.accessService.assertEditor(userId, docId);
        const draft = await this.prisma.documentDraft.findUnique({
            where: { documentId: docId },
        });
        const content = (draft?.content ?? EMPTY_DOC);
        return this.prisma.$transaction(async (tx) => {
            if (dto.markAsCurrent) {
                await tx.documentVersion.updateMany({
                    where: { documentId: docId, isCurrent: true },
                    data: { isCurrent: false },
                });
            }
            const version = await tx.documentVersion.create({
                data: {
                    id: (0, crypto_1.randomUUID)(),
                    documentId: docId,
                    name: dto.name,
                    comment: dto.comment,
                    content,
                    createdBy: userId,
                    basedOnVersionId: dto.basedOnVersionId,
                    source: client_1.VersionSource.manual,
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
    async createImportVersion(userId, docId, payload) {
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
                    id: (0, crypto_1.randomUUID)(),
                    documentId: docId,
                    name: payload.name,
                    comment: payload.comment,
                    content: payload.content,
                    createdBy: userId,
                    source: client_1.VersionSource.import,
                    importWarnings: payload.importWarnings,
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
    async getVersion(userId, versionId) {
        const version = await this.prisma.documentVersion.findUnique({
            where: { id: versionId },
            include: { createdByUser: { select: { id: true, fullName: true } } },
        });
        if (!version) {
            throw new common_1.NotFoundException('Versión no encontrada.');
        }
        const access = await this.accessService.getAccess(userId, version.documentId);
        if (access.role === client_1.DocumentRole.viewer && !access.canViewHistory) {
            throw new common_1.ForbiddenException('No tienes permisos para ver el historial.');
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
            importWarnings: version.importWarnings,
            content: version.content,
            createdAt: version.createdAt,
        };
    }
    async setCurrent(userId, versionId) {
        const version = await this.prisma.documentVersion.findUnique({
            where: { id: versionId },
            select: { id: true, documentId: true },
        });
        if (!version) {
            throw new common_1.NotFoundException('Versión no encontrada.');
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
    async deleteVersion(userId, versionId) {
        const version = await this.prisma.documentVersion.findUnique({
            where: { id: versionId },
            select: { id: true, documentId: true, createdBy: true, isCurrent: true },
        });
        if (!version) {
            throw new common_1.NotFoundException('Versión no encontrada.');
        }
        if (version.isCurrent) {
            throw new common_1.BadRequestException('No puedes eliminar la versión actual.');
        }
        const access = await this.accessService.assertEditor(userId, version.documentId);
        const isAdmin = await this.isWorkspaceAdmin(userId, access.workspaceId);
        if (!isAdmin && version.createdBy !== userId) {
            throw new common_1.ForbiddenException('No puedes eliminar esta versión.');
        }
        await this.prisma.documentVersion.delete({ where: { id: version.id } });
        return { deleted: true };
    }
    async notifyCurrentVersion(docId, actorId, versionId) {
        const members = await this.prisma.documentMember.findMany({
            where: { documentId: docId },
            select: { userId: true },
        });
        await Promise.all(members.map((member) => this.notificationsService.create({
            userId: member.userId,
            type: 'new_current_version',
            documentId: docId,
            relatedUserId: actorId,
            payload: { versionId },
        })));
    }
    async isWorkspaceAdmin(userId, workspaceId) {
        const member = await this.prisma.workspaceMember.findFirst({
            where: { workspaceId, userId },
            select: { role: true },
        });
        return member?.role === client_1.WorkspaceRole.admin;
    }
};
exports.VersionsService = VersionsService;
exports.VersionsService = VersionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        document_access_service_1.DocumentAccessService,
        notifications_service_1.NotificationsService])
], VersionsService);
//# sourceMappingURL=versions.service.js.map