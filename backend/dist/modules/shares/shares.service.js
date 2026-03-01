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
exports.SharesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../integrations/prisma/prisma.service");
const document_access_service_1 = require("../../common/services/document-access.service");
const crypto_1 = require("crypto");
const config_1 = require("@nestjs/config");
let SharesService = class SharesService {
    constructor(prisma, accessService, configService) {
        this.prisma = prisma;
        this.accessService = accessService;
        this.configService = configService;
    }
    async create(docId, userId, dto) {
        await this.accessService.assertEditor(userId, docId);
        if (dto.mode === 'fixed' && !dto.versionId) {
            throw new common_1.ForbiddenException('Se requiere versionId para compartir fijo.');
        }
        const share = await this.prisma.sharedLink.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                documentId: docId,
                versionId: dto.mode === 'fixed' ? dto.versionId ?? null : null,
                token: (0, crypto_1.randomBytes)(32).toString('hex'),
                mode: dto.mode,
                allowHistory: dto.allowHistory ?? false,
                createdBy: userId,
            },
            include: { createdByUser: { select: { id: true, fullName: true } } },
        });
        return this.mapShare(share);
    }
    async list(docId, userId, page, limit, sortBy, sortOrder) {
        await this.accessService.assertEditor(userId, docId);
        const pageValue = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
        const limitValue = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 100) : 20;
        const order = sortOrder === 'asc' ? 'asc' : 'desc';
        const allowedSort = new Set(['createdAt']);
        const sortKey = allowedSort.has(sortBy ?? '') ? 'createdAt' : 'createdAt';
        const where = { documentId: docId };
        const total = await this.prisma.sharedLink.count({ where });
        const shares = await this.prisma.sharedLink.findMany({
            where,
            include: { createdByUser: { select: { id: true, fullName: true } } },
            orderBy: { [sortKey]: order },
            skip: (pageValue - 1) * limitValue,
            take: limitValue,
        });
        return {
            data: shares.map((share) => this.mapShare(share)),
            meta: {
                total,
                page: pageValue,
                limit: limitValue,
                totalPages: Math.ceil(total / limitValue),
            },
        };
    }
    async revoke(shareId, userId) {
        const share = await this.prisma.sharedLink.findUnique({
            where: { id: shareId },
            select: { id: true, documentId: true },
        });
        if (!share) {
            throw new common_1.NotFoundException('Share no encontrado.');
        }
        await this.accessService.assertEditor(userId, share.documentId);
        return this.prisma.sharedLink.update({
            where: { id: shareId },
            data: { revokedAt: new Date() },
        });
    }
    async resolve(token, access) {
        const share = await this.prisma.sharedLink.findFirst({
            where: { token, revokedAt: null },
            include: { document: true },
        });
        if (!share) {
            throw new common_1.NotFoundException('Share no encontrado.');
        }
        await this.prisma.sharedLinkAccessLog.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                sharedLinkId: share.id,
                ipAddress: access.ipAddress,
                userAgent: access.userAgent ?? undefined,
            },
        });
        const version = share.mode === 'dynamic'
            ? await this.prisma.documentVersion.findFirst({
                where: { documentId: share.documentId, isCurrent: true },
            })
            : await this.prisma.documentVersion.findUnique({
                where: { id: share.versionId ?? '' },
            });
        if (!version) {
            throw new common_1.HttpException('VERSION_DELETED', common_1.HttpStatus.GONE);
        }
        return {
            documentTitle: share.document.title,
            versionName: version.name,
            versionContent: version.content,
            allowHistory: share.allowHistory,
            mode: share.mode,
        };
    }
    mapShare(share) {
        const baseUrl = this.configService.get('app.frontendUrl') ?? '';
        const normalized = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        return {
            id: share.id,
            token: share.token,
            url: normalized ? `${normalized}/s/${share.token}` : `/s/${share.token}`,
            mode: share.mode,
            allowHistory: share.allowHistory,
            versionId: share.versionId,
            createdBy: share.createdByUser,
            createdAt: share.createdAt,
            revokedAt: share.revokedAt,
        };
    }
};
exports.SharesService = SharesService;
exports.SharesService = SharesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        document_access_service_1.DocumentAccessService,
        config_1.ConfigService])
], SharesService);
//# sourceMappingURL=shares.service.js.map