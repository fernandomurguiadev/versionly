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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../integrations/prisma/prisma.service");
const crypto_1 = require("crypto");
const sse_service_1 = require("../../integrations/sse/sse.service");
let NotificationsService = class NotificationsService {
    constructor(prisma, sseService) {
        this.prisma = prisma;
        this.sseService = sseService;
    }
    async create(input) {
        const notification = await this.prisma.notification.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                userId: input.userId,
                type: input.type,
                documentId: input.documentId ?? null,
                relatedUserId: input.relatedUserId ?? null,
                payload: (input.payload ?? {}),
            },
        });
        this.sseService.emit(input.userId, {
            type: 'notification.created',
            notification,
        });
        return notification;
    }
    async list(userId, unreadOnly, page, limit, sortBy, sortOrder) {
        const pageValue = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
        const limitValue = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 100) : 20;
        const order = sortOrder === 'asc' ? 'asc' : 'desc';
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
    async markRead(userId, notificationId) {
        return this.prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: { readAt: new Date() },
        });
    }
    async markAllRead(userId) {
        return this.prisma.notification.updateMany({
            where: { userId, readAt: null },
            data: { readAt: new Date() },
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        sse_service_1.SseService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map