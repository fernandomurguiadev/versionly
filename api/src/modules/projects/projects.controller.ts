import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { WorkspaceRoleGuard } from '../../common/guards/workspace-role.guard';
import { WorkspaceRoles } from '../../common/decorators/workspace-roles.decorator';
import { WorkspaceRole } from '@prisma/client';
import { UuidValidationPipe } from '../../common/pipes/uuid-validation.pipe';

@Controller()
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('workspaces/:wsId/projects')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(WorkspaceRole.viewer, WorkspaceRole.editor, WorkspaceRole.admin)
  list(
    @CurrentUser() user: { userId: string },
    @Param('wsId', UuidValidationPipe) wsId: string,
    @Query('q') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.projectsService.listProjects(user.userId, wsId, search, page, limit, sortBy, sortOrder);
  }

  @Post('workspaces/:wsId/projects')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(WorkspaceRole.admin)
  create(
    @CurrentUser() user: { userId: string },
    @Param('wsId', UuidValidationPipe) wsId: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.createProject(user.userId, wsId, dto);
  }

  @Get('projects/:projectId')
  get(
    @CurrentUser() user: { userId: string },
    @Param('projectId', UuidValidationPipe) projectId: string,
  ) {
    return this.projectsService.getProject(user.userId, projectId);
  }

  @Patch('projects/:projectId')
  update(
    @CurrentUser() user: { userId: string },
    @Param('projectId', UuidValidationPipe) projectId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.updateProject(user.userId, projectId, dto);
  }

  @Delete('projects/:projectId')
  remove(
    @CurrentUser() user: { userId: string },
    @Param('projectId', UuidValidationPipe) projectId: string,
  ) {
    return this.projectsService.deleteProject(user.userId, projectId);
  }
}
