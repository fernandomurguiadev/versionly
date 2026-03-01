import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { DocumentRole, WorkspaceRole } from '@prisma/client';

type DocumentAccess = {
  documentId: string;
  workspaceId: string;
  role: DocumentRole;
  canViewHistory: boolean;
};

@Injectable()
export class DocumentAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async getAccess(userId: string, docId: string): Promise<DocumentAccess> {
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
      throw new NotFoundException('Documento no encontrado.');
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
      throw new ForbiddenException('No tienes acceso al documento.');
    }

    if (workspaceMember) {
      const role = workspaceMember.role === WorkspaceRole.viewer ? DocumentRole.viewer : DocumentRole.editor;
      return {
        documentId: docId,
        workspaceId,
        role,
        canViewHistory: workspaceMember.role !== WorkspaceRole.viewer || documentMember?.canViewHistory === true,
      };
    }

    return {
      documentId: docId,
      workspaceId,
      role: documentMember?.role ?? DocumentRole.viewer,
      canViewHistory: documentMember?.canViewHistory === true,
    };
  }

  async assertEditor(userId: string, docId: string) {
    const access = await this.getAccess(userId, docId);
    if (access.role !== DocumentRole.editor) {
      throw new ForbiddenException('No tienes permisos para editar el documento.');
    }
    return access;
  }
}
