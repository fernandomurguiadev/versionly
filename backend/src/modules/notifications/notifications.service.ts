import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { NotificationType, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { SseService } from '../../integrations/sse/sse.service';
import { PaginatedResponse } from '../../common/types/paginated-response.type';

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  documentId?: string | null;
  relatedUserId?: string | null;
  payload?: Record<string, unknown>;
};

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sseService: SseService,
  ) {}

  async create(input: CreateNotificationInput) {
    const notification = await this.prisma.notification.create({
      data: {
        id: randomUUID(),
        userId: input.userId,
        type: input.type,
        documentId: input.documentId ?? null,
        relatedUserId: input.relatedUserId ?? null,
        payload: (input.payload ?? {}) as Prisma.InputJsonValue,
      },
    });

    this.sseService.emit(input.userId, {
      type: 'notification.created',
      notification,
    });

    return notification;
  }

  async list(
    userId: string,
    unreadOnly?: boolean,
    page?: string,
    limit?: string,
    sortBy?: string,
    sortOrder?: string,
  ): Promise<PaginatedResponse<{ id: string; userId: string; type: NotificationType }>> {
    const pageValue = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
    const limitValue = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 100) : 20;
    const order: 'asc' | 'desc' = sortOrder === 'asc' ? 'asc' : 'desc';
    const allowedSort = new Set(['createdAt']);
    const sortKey = allowedSort.has(sortBy ?? '') ? 'createdAt' : 'createdAt';
    const where = {
      userId,
      ...(unreadOnly ? { readAt: null } : {}),
    };
    const total = await this.prisma.notification.count({ where });
    const notifications = await this.prisma.notification.findMany({
      where,
      orderBy: { [sortKey]: order },
      skip: (pageValue - 1) * limitValue,
      take: limitValue,
    });
    return {
      data: notifications,
      meta: {
        total,
        page: pageValue,
        limit: limitValue,
        totalPages: Math.ceil(total / limitValue),
      },
    };
  }

  async markRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }
}
