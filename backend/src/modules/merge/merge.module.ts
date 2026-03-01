import { Module } from '@nestjs/common';
import { MergeController } from './merge.controller';
import { MergeService } from './merge.service';
import { PrismaModule } from '../../integrations/prisma/prisma.module';
import { DocumentAccessService } from '../../common/services/document-access.service';
import { VersionsModule } from '../versions/versions.module';
import { DocumentRoleGuard } from '../../common/guards/document-role.guard';

@Module({
  imports: [PrismaModule, VersionsModule],
  controllers: [MergeController],
  providers: [MergeService, DocumentAccessService, DocumentRoleGuard],
})
export class MergeModule {}
