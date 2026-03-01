import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DocumentRole } from '@prisma/client';
import { DocumentAccessService } from '../services/document-access.service';
import { DOCUMENT_ROLES_KEY } from '../decorators/document-roles.decorator';

@Injectable()
export class DocumentRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly documentAccess: DocumentAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<DocumentRole[]>(DOCUMENT_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: { userId: string; documentRole?: DocumentRole }; params?: Record<string, string> }>();
    const userId = request.user?.userId;
    const docId = request.params?.docId ?? request.params?.documentId;

    if (!userId || !docId) {
      throw new ForbiddenException('No tienes acceso al documento.');
    }

    const access = await this.documentAccess.getAccess(userId, docId);
    request.user = { userId, documentRole: access.role };

    if (!requiredRoles.includes(access.role)) {
      throw new ForbiddenException('No tienes permisos suficientes.');
    }

    return true;
  }
}
