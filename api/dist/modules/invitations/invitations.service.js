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
exports.InvitationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../integrations/prisma/prisma.service");
const email_service_1 = require("../../integrations/email/email.service");
const crypto_1 = require("crypto");
const client_1 = require("@prisma/client");
let InvitationsService = class InvitationsService {
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async create(wsId, adminId, dto) {
        const member = await this.prisma.workspaceMember.findFirst({
            where: { workspaceId: wsId, userId: adminId },
            select: { role: true },
        });
        if (!member || member.role !== client_1.WorkspaceRole.admin) {
            throw new common_1.ForbiddenException('No tienes permisos para invitar.');
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
            select: { id: true },
        });
        if (existingUser) {
            const alreadyMember = await this.prisma.workspaceMember.findFirst({
                where: { workspaceId: wsId, userId: existingUser.id },
                select: { id: true },
            });
            if (alreadyMember) {
                throw new common_1.ConflictException('El usuario ya es miembro del workspace.');
            }
        }
        const existingInvitation = await this.prisma.workspaceInvitation.findFirst({
            where: { workspaceId: wsId, email: dto.email },
            select: { id: true },
        });
        if (existingInvitation) {
            await this.prisma.workspaceInvitation.delete({ where: { id: existingInvitation.id } });
        }
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const invitation = await this.prisma.workspaceInvitation.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                workspaceId: wsId,
                email: dto.email,
                role: dto.role,
                token: (0, crypto_1.randomUUID)(),
                expiresAt,
                createdBy: adminId,
            },
            include: {
                workspace: { select: { name: true } },
            },
        });
        await this.emailService.sendInvitation({
            email: invitation.email,
            workspaceName: invitation.workspace.name,
            token: invitation.token,
            role: invitation.role,
        });
        return invitation;
    }
    async validate(token) {
        const invitation = await this.prisma.workspaceInvitation.findFirst({
            where: { token },
            include: { workspace: { select: { name: true } } },
        });
        if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date()) {
            throw new common_1.NotFoundException('Invitación inválida.');
        }
        return {
            workspaceId: invitation.workspaceId,
            workspaceName: invitation.workspace.name,
            email: invitation.email,
            role: invitation.role,
            expiresAt: invitation.expiresAt,
        };
    }
    async accept(token, userId) {
        const invitation = await this.prisma.workspaceInvitation.findFirst({
            where: { token },
        });
        if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date()) {
            throw new common_1.NotFoundException('Invitación inválida.');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { email: true },
        });
        if (!user || user.email !== invitation.email) {
            throw new common_1.BadRequestException('El email no coincide con la invitación.');
        }
        const alreadyMember = await this.prisma.workspaceMember.findFirst({
            where: { workspaceId: invitation.workspaceId, userId },
            select: { id: true },
        });
        if (alreadyMember) {
            throw new common_1.ConflictException('El usuario ya es miembro del workspace.');
        }
        await this.prisma.$transaction([
            this.prisma.workspaceMember.create({
                data: {
                    id: (0, crypto_1.randomUUID)(),
                    workspaceId: invitation.workspaceId,
                    userId,
                    role: invitation.role === 'editor' ? client_1.WorkspaceRole.editor : client_1.WorkspaceRole.viewer,
                },
            }),
            this.prisma.workspaceInvitation.update({
                where: { id: invitation.id },
                data: { acceptedAt: new Date() },
            }),
        ]);
        return { accepted: true };
    }
    async cancel(wsId, invitationId, adminId) {
        const member = await this.prisma.workspaceMember.findFirst({
            where: { workspaceId: wsId, userId: adminId },
            select: { role: true },
        });
        if (!member || member.role !== client_1.WorkspaceRole.admin) {
            throw new common_1.ForbiddenException('No tienes permisos para cancelar.');
        }
        await this.prisma.workspaceInvitation.delete({
            where: { id: invitationId },
        });
        return { deleted: true };
    }
};
exports.InvitationsService = InvitationsService;
exports.InvitationsService = InvitationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], InvitationsService);
//# sourceMappingURL=invitations.service.js.map