import { Controller, Get, Param, Patch, Query, Req, Res, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FastifyReply, FastifyRequest } from 'fastify';
import { SseService } from '../../integrations/sse/sse.service';
import { UuidValidationPipe } from '../../common/pipes/uuid-validation.pipe';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly sseService: SseService,
  ) {}

  @Get()
  list(
    @CurrentUser() user: { userId: string },
    @Query('unread') unread?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.notificationsService.list(user.userId, unread === 'true', page, limit, sortBy, sortOrder);
  }

  @Patch(':notificationId/read')
  read(
    @CurrentUser() user: { userId: string },
    @Param('notificationId', UuidValidationPipe) notificationId: string,
  ) {
    return this.notificationsService.markRead(user.userId, notificationId);
  }

  @Patch('read-all')
  readAll(@CurrentUser() user: { userId: string }) {
    return this.notificationsService.markAllRead(user.userId);
  }

  @Get('stream')
  stream(
    @CurrentUser() user: { userId: string },
    @Res({ passthrough: false }) reply: FastifyReply,
    @Req() request: FastifyRequest,
  ) {
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.write('\n');

    this.sseService.addConnection(user.userId, reply.raw);

    const heartbeat = setInterval(() => {
      reply.raw.write(':\n\n');
    }, 30000);

    request.raw.on('close', () => {
      clearInterval(heartbeat);
      this.sseService.removeConnection(user.userId, reply.raw);
    });

    return reply;
  }
}
