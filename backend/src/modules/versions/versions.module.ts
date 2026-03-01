import { Module } from '@nestjs/common';
import { VersionsController } from './versions.controller';
import { VersionsService } from './versions.service';
import { PrismaModule } from '../../integrations/prisma/prisma.module';
import { DocumentAccessService } from '../../common/services/document-access.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { DocumentRoleGuard } from '../../common/guards/document-role.guard';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [VersionsController],
  providers: [VersionsService, DocumentAccessService, DocumentRoleGuard],
  exports: [VersionsService],
})
export class VersionsModule {}
