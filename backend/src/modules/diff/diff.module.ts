import { Module } from '@nestjs/common';
import { DiffController } from './diff.controller';
import { DiffService } from './diff.service';
import { PrismaModule } from '../../integrations/prisma/prisma.module';
import { DocumentAccessService } from '../../common/services/document-access.service';

@Module({
  imports: [PrismaModule],
  controllers: [DiffController],
  providers: [DiffService, DocumentAccessService],
})
export class DiffModule {}
