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
exports.MergeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../integrations/prisma/prisma.service");
const document_access_service_1 = require("../../common/services/document-access.service");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const versions_service_1 = require("../versions/versions.service");
let MergeService = class MergeService {
    constructor(prisma, accessService, versionsService) {
        this.prisma = prisma;
        this.accessService = accessService;
        this.versionsService = versionsService;
    }
    async getConflicts(userId, docId) {
        await this.accessService.assertEditor(userId, docId);
        const versions = await this.prisma.documentVersion.findMany({
            where: {
                documentId: docId,
                basedOnVersionId: { not: null },
            },
            include: { createdByUser: { select: { id: true, fullName: true } } },
            orderBy: { createdAt: 'desc' },
        });
        const grouped = new Map();
        versions.forEach((version) => {
            const key = version.basedOnVersionId ?? '';
            const bucket = grouped.get(key) ?? [];
            bucket.push(version);
            grouped.set(key, bucket);
        });
        return Array.from(grouped.entries())
            .filter(([, bucket]) => bucket.length > 1)
            .map(([basedOnVersionId, bucket]) => ({
            basedOnVersionId,
            versions: bucket.map((version) => ({
                id: version.id,
                name: version.name,
                createdAt: version.createdAt,
                createdBy: version.createdByUser,
            })),
        }));
    }
    async createMerge(userId, docId, dto) {
        await this.accessService.assertEditor(userId, docId);
        const version = await this.prisma.documentVersion.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                documentId: docId,
                name: dto.name,
                comment: dto.comment,
                content: dto.content,
                createdBy: userId,
                source: client_1.VersionSource.merge,
                mergeFromA: dto.mergeFromA,
                mergeFromB: dto.mergeFromB,
                isCurrent: false,
            },
        });
        if (dto.markAsCurrent) {
            await this.versionsService.setCurrent(userId, version.id);
        }
        return version;
    }
};
exports.MergeService = MergeService;
exports.MergeService = MergeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        document_access_service_1.DocumentAccessService,
        versions_service_1.VersionsService])
], MergeService);
//# sourceMappingURL=merge.service.js.map