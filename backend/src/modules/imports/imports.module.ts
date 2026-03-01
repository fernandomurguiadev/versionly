import { Module } from '@nestjs/common';
import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';
import { DocumentsModule } from '../documents/documents.module';
import { VersionsModule } from '../versions/versions.module';

@Module({
  imports: [DocumentsModule, VersionsModule],
  controllers: [ImportsController],
  providers: [ImportsService],
})
export class ImportsModule {}
