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
exports.DiffService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../integrations/prisma/prisma.service");
const document_access_service_1 = require("../../common/services/document-access.service");
const client_1 = require("@prisma/client");
let DiffService = class DiffService {
    constructor(prisma, accessService) {
        this.prisma = prisma;
        this.accessService = accessService;
    }
    async compute(userId, versionAId, versionBId) {
        const [versionA, versionB] = await Promise.all([
            this.prisma.documentVersion.findUnique({
                where: { id: versionAId },
                include: { createdByUser: { select: { id: true, fullName: true } } },
            }),
            this.prisma.documentVersion.findUnique({
                where: { id: versionBId },
                include: { createdByUser: { select: { id: true, fullName: true } } },
            }),
        ]);
        if (!versionA || !versionB) {
            throw new common_1.NotFoundException('Versión no encontrada.');
        }
        const access = await this.accessService.getAccess(userId, versionA.documentId);
        if (access.role === client_1.DocumentRole.viewer && !access.canViewHistory) {
            throw new common_1.ForbiddenException('No tienes permisos para ver el historial.');
        }
        if (versionA.documentId !== versionB.documentId) {
            throw new common_1.ForbiddenException('Las versiones no pertenecen al mismo documento.');
        }
        const textA = JSON.stringify(versionA.content ?? {});
        const textB = JSON.stringify(versionB.content ?? {});
        let added = 0;
        let removed = 0;
        let unchanged = 0;
        let changes = [];
        if (textA === textB) {
            unchanged = textA.length;
            changes = [{ type: 'equal', nodeType: 'text', level: null, a: textA, b: textB }];
        }
        else {
            removed = textA.length;
            added = textB.length;
            changes = [{ type: 'replace', nodeType: 'text', level: null, a: textA, b: textB }];
        }
        return {
            versionA: {
                id: versionA.id,
                documentId: versionA.documentId,
                name: versionA.name,
                comment: versionA.comment,
                source: versionA.source,
                isCurrent: versionA.isCurrent,
                createdBy: versionA.createdByUser,
                basedOnVersionId: versionA.basedOnVersionId,
                createdAt: versionA.createdAt,
            },
            versionB: {
                id: versionB.id,
                documentId: versionB.documentId,
                name: versionB.name,
                comment: versionB.comment,
                source: versionB.source,
                isCurrent: versionB.isCurrent,
                createdBy: versionB.createdByUser,
                basedOnVersionId: versionB.basedOnVersionId,
                createdAt: versionB.createdAt,
            },
            summary: {
                added,
                removed,
                modified: Math.min(added, removed),
                unchanged,
            },
            changes,
        };
    }
};
exports.DiffService = DiffService;
exports.DiffService = DiffService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        document_access_service_1.DocumentAccessService])
], DiffService);
//# sourceMappingURL=diff.service.js.map