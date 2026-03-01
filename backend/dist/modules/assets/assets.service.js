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
exports.AssetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../integrations/prisma/prisma.service");
const document_access_service_1 = require("../../common/services/document-access.service");
const storage_service_1 = require("../../integrations/storage/storage.service");
const crypto_1 = require("crypto");
const client_1 = require("@prisma/client");
const MAX_ASSET_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']);
let AssetsService = class AssetsService {
    constructor(prisma, accessService, storageService) {
        this.prisma = prisma;
        this.accessService = accessService;
        this.storageService = storageService;
    }
    async list(userId, docId, page, limit, sortBy, sortOrder) {
        await this.accessService.getAccess(userId, docId);
        const pageValue = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
        const limitValue = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 100) : 20;
        const order = sortOrder === 'asc' ? 'asc' : 'desc';
        const allowedSort = new Set(['createdAt', 'filename']);
        const sortKey = allowedSort.has(sortBy ?? '') ? sortBy : 'createdAt';
        const where = { documentId: docId };
        const total = await this.prisma.documentAsset.count({ where });
        const assets = await this.prisma.documentAsset.findMany({
            where,
            orderBy: { [sortKey]: order },
            skip: (pageValue - 1) * limitValue,
            take: limitValue,
        });
        return {
            data: assets.map((asset) => ({
                id: asset.id,
                documentId: asset.documentId,
                filename: asset.filename,
                mimeType: asset.mimeType,
                sizeBytes: asset.sizeBytes,
                url: this.storageService.getPublicUrl(asset.storageKey),
                createdAt: asset.createdAt,
            })),
            meta: {
                total,
                page: pageValue,
                limit: limitValue,
                totalPages: Math.ceil(total / limitValue),
            },
        };
    }
    async upload(userId, docId, dto) {
        await this.accessService.assertEditor(userId, docId);
        if (!ALLOWED_MIME.has(dto.mimeType)) {
            throw new common_1.BadRequestException('Tipo de archivo no permitido.');
        }
        const buffer = Buffer.from(dto.contentBase64, 'base64');
        if (buffer.length === 0) {
            throw new common_1.BadRequestException('Archivo vacío.');
        }
        if (buffer.length > MAX_ASSET_SIZE) {
            throw new common_1.BadRequestException('Archivo supera el tamaño permitido.');
        }
        const assetId = (0, crypto_1.randomUUID)();
        const storageKey = `documents/${docId}/assets/${assetId}-${dto.filename}`;
        await this.storageService.upload(storageKey, buffer, dto.mimeType);
        return this.prisma.documentAsset.create({
            data: {
                id: assetId,
                documentId: docId,
                uploadedBy: userId,
                filename: dto.filename,
                storageKey,
                mimeType: dto.mimeType,
                sizeBytes: buffer.length,
            },
        });
    }
    async remove(userId, assetId) {
        const asset = await this.prisma.documentAsset.findUnique({
            where: { id: assetId },
        });
        if (!asset) {
            throw new common_1.NotFoundException('Asset no encontrado.');
        }
        const access = await this.accessService.getAccess(userId, asset.documentId);
        if (access.role !== client_1.DocumentRole.editor) {
            throw new common_1.ForbiddenException('No tienes permisos para eliminar el asset.');
        }
        await this.storageService.delete(asset.storageKey);
        await this.prisma.documentAsset.delete({ where: { id: assetId } });
        return { deleted: true };
    }
};
exports.AssetsService = AssetsService;
exports.AssetsService = AssetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        document_access_service_1.DocumentAccessService,
        storage_service_1.StorageService])
], AssetsService);
//# sourceMappingURL=assets.service.js.map