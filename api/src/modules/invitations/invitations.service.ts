import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { EmailService } from '../../integrations/email/email.service';
import { randomUUID } from 'crypto';
import { WorkspaceRole } from '@prisma/client';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async create(wsId: string, adminId: string, dto: CreateInvitationDto) {
    const member = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId: wsId, userId: adminId },
      select: { role: true },
    });

    if (!member || member.role !== WorkspaceRole.admin) {
      throw new ForbiddenException('No tienes permisos para invitar.');
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
        throw new ConflictException('El usuario ya es miembro del workspace.');
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
        id: randomUUID(),
        workspaceId: wsId,
        email: dto.email,
        role: dto.role,
        token: randomUUID(),
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

  async validate(token: string) {
    const invitation = await this.prisma.workspaceInvitation.findFirst({
      where: { token },
      include: { workspace: { select: { name: true } } },
    });

    if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date()) {
      throw new NotFoundException('Invitación inválida.');
    }

    return {
      workspaceId: invitation.workspaceId,
      workspaceName: invitation.workspace.name,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
    };
  }

  async accept(token: string, userId: string) {
    const invitation = await this.prisma.workspaceInvitation.findFirst({
      where: { token },
    });

    if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date()) {
      throw new NotFoundException('Invitación inválida.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user || user.email !== invitation.email) {
      throw new BadRequestException('El email no coincide con la invitación.');
    }

    const alreadyMember = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId: invitation.workspaceId, userId },
      select: { id: true },
    });

    if (alreadyMember) {
      throw new ConflictException('El usuario ya es miembro del workspace.');
    }

    await this.prisma.$transaction([
      this.prisma.workspaceMember.create({
        data: {
          id: randomUUID(),
          workspaceId: invitation.workspaceId,
          userId,
          role: invitation.role === 'editor' ? WorkspaceRole.editor : WorkspaceRole.viewer,
        },
      }),
      this.prisma.workspaceInvitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      }),
    ]);

    return { accepted: true };
  }

  async cancel(wsId: string, invitationId: string, adminId: string) {
    const member = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId: wsId, userId: adminId },
      select: { role: true },
    });

    if (!member || member.role !== WorkspaceRole.admin) {
      throw new ForbiddenException('No tienes permisos para cancelar.');
    }

    await this.prisma.workspaceInvitation.delete({
      where: { id: invitationId },
    });

    return { deleted: true };
  }
}
