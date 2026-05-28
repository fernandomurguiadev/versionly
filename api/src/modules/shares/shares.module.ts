import { Module } from '@nestjs/common';
import { SharesController } from './shares.controller';
import { SharesService } from './shares.service';
import { PrismaModule } from '../../integrations/prisma/prisma.module';
import { DocumentAccessService } from '../../common/services/document-access.service';
import { DocumentRoleGuard } from '../../common/guards/document-role.guard';

@Module({
  imports: [PrismaModule],
  controllers: [SharesController],
  providers: [SharesService, DocumentAccessService, DocumentRoleGuard],
})
export class SharesModule {}
