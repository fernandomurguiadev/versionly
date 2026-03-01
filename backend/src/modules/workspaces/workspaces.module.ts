import { Module } from '@nestjs/common';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';
import { PrismaModule } from '../../integrations/prisma/prisma.module';
import { WorkspaceRoleGuard } from '../../common/guards/workspace-role.guard';

@Module({
  imports: [PrismaModule],
  controllers: [WorkspacesController],
  providers: [WorkspacesService, WorkspaceRoleGuard],
})
export class WorkspacesModule {}
