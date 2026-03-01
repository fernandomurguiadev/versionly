import { WorkspaceInvitationRole } from '@prisma/client';

export class InvitationResponseDto {
  id: string;
  workspaceId: string;
  email: string;
  role: WorkspaceInvitationRole;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
}
