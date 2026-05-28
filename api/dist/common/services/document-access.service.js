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
exports.DocumentAccessService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../integrations/prisma/prisma.service");
const client_1 = require("@prisma/client");
let DocumentAccessService = class DocumentAccessService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAccess(userId, docId) {
        const document = await this.prisma.document.findUnique({
            where: { id: docId },
            select: {
                id: true,
                folder: {
                    select: {
                        project: {
                            select: { workspaceId: true },
                        },
                    },
                },
            },
        });
        if (!document) {
            throw new common_1.NotFoundException('Documento no encontrado.');
        }
        const workspaceId = document.folder.project.workspaceId;
        const [workspaceMember, documentMember] = await Promise.all([
            this.prisma.workspaceMember.findFirst({
                where: { workspaceId, userId },
                select: { role: true },
            }),
            this.prisma.documentMember.findFirst({
                where: { documentId: docId, userId },
                select: { role: true, canViewHistory: true },
            }),
        ]);
        if (!workspaceMember && !documentMember) {
            throw new common_1.ForbiddenException('No tienes acceso al documento.');
        }
        if (workspaceMember) {
            const role = workspaceMember.role === client_1.WorkspaceRole.viewer ? client_1.DocumentRole.viewer : client_1.DocumentRole.editor;
            return {
                documentId: docId,
                workspaceId,
                role,
                canViewHistory: workspaceMember.role !== client_1.WorkspaceRole.viewer || documentMember?.canViewHistory === true,
            };
        }
        return {
            documentId: docId,
            workspaceId,
            role: documentMember?.role ?? client_1.DocumentRole.viewer,
            canViewHistory: documentMember?.canViewHistory === true,
        };
    }
    async assertEditor(userId, docId) {
        const access = await this.getAccess(userId, docId);
        if (access.role !== client_1.DocumentRole.editor) {
            throw new common_1.ForbiddenException('No tienes permisos para editar el documento.');
        }
        return access;
    }
};
exports.DocumentAccessService = DocumentAccessService;
exports.DocumentAccessService = DocumentAccessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentAccessService);
//# sourceMappingURL=document-access.service.js.map