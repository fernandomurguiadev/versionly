import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { PrismaModule } from '../../integrations/prisma/prisma.module';
import { WorkspaceRoleGuard } from '../../common/guards/workspace-role.guard';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, WorkspaceRoleGuard],
})
export class ProjectsModule {}
