import { SetMetadata } from '@nestjs/common';
import { DocumentRole } from '@prisma/client';

export const DOCUMENT_ROLES_KEY = 'document_roles';

export const DocumentRoles = (...roles: DocumentRole[]) => SetMetadata(DOCUMENT_ROLES_KEY, roles);
