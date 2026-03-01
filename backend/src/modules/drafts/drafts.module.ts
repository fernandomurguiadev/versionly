import { Module } from '@nestjs/common';
import { DraftsController } from './drafts.controller';
import { DraftsService } from './drafts.service';
import { PrismaModule } from '../../integrations/prisma/prisma.module';
import { DocumentAccessService } from '../../common/services/document-access.service';
import { DocumentRoleGuard } from '../../common/guards/document-role.guard';

@Module({
  imports: [PrismaModule],
  controllers: [DraftsController],
  providers: [DraftsService, DocumentAccessService, DocumentRoleGuard],
})
export class DraftsModule {}
