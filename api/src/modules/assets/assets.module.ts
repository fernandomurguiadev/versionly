import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { PrismaModule } from '../../integrations/prisma/prisma.module';
import { StorageModule } from '../../integrations/storage/storage.module';
import { DocumentAccessService } from '../../common/services/document-access.service';
import { DocumentRoleGuard } from '../../common/guards/document-role.guard';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [AssetsController],
  providers: [AssetsService, DocumentAccessService, DocumentRoleGuard],
})
export class AssetsModule {}
