import { NotificationType } from '@prisma/client';

export class NotificationResponseDto {
  id: string;
  type: NotificationType;
  documentId: string | null;
  relatedUserId: string | null;
  payload: Record<string, unknown>;
  readAt: Date | null;
  createdAt: Date;
}
