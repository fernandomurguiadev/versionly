import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PrismaModule } from '../../integrations/prisma/prisma.module';
import { SseModule } from '../../integrations/sse/sse.module';

@Module({
  imports: [PrismaModule, SseModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
