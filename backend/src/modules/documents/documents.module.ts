import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { PrismaModule } from '../../integrations/prisma/prisma.module';
import { DocumentAccessService } from '../../common/services/document-access.service';
import { DocumentRoleGuard } from '../../common/guards/document-role.guard';

@Module({
  imports: [PrismaModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentAccessService, DocumentRoleGuard],
  exports: [DocumentsService, DocumentAccessService],
})
export class DocumentsModule {}
