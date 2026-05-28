import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { WorkspaceRoles } from '../../common/decorators/workspace-roles.decorator';
import { WorkspaceRole } from '@prisma/client';
import { WorkspaceRoleGuard } from '../../common/guards/workspace-role.guard';
import { UuidValidationPipe } from '../../common/pipes/uuid-validation.pipe';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  list(
    @CurrentUser() user: { userId: string },
    @Query('q') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.workspacesService.listWorkspaces(user.userId, search, page, limit, sortBy, sortOrder);
  }

  @Post()
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreateWorkspaceDto) {
    return this.workspacesService.createWorkspace(user.userId, dto);
  }

  @Get(':wsId')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(WorkspaceRole.viewer, WorkspaceRole.editor, WorkspaceRole.admin)
  get(@CurrentUser() user: { userId: string }, @Param('wsId', UuidValidationPipe) wsId: string) {
    return this.workspacesService.getWorkspace(user.userId, wsId);
  }

  @Patch(':wsId')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(WorkspaceRole.admin)
  update(
    @CurrentUser() user: { userId: string },
    @Param('wsId', UuidValidationPipe) wsId: string,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    return this.workspacesService.updateWorkspace(user.userId, wsId, dto);
  }

  @Delete(':wsId')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(WorkspaceRole.admin)
  delete(@CurrentUser() user: { userId: string }, @Param('wsId', UuidValidationPipe) wsId: string) {
    return this.workspacesService.deleteWorkspace(user.userId, wsId);
  }

  @Get(':wsId/members')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(WorkspaceRole.viewer, WorkspaceRole.editor, WorkspaceRole.admin)
  listMembers(
    @CurrentUser() user: { userId: string },
    @Param('wsId', UuidValidationPipe) wsId: string,
    @Query('q') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.workspacesService.listMembers(user.userId, wsId, search, page, limit, sortBy, sortOrder);
  }

  @Post(':wsId/members')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(WorkspaceRole.admin)
  addMember(
    @CurrentUser() user: { userId: string },
    @Param('wsId', UuidValidationPipe) wsId: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.workspacesService.addMember(user.userId, wsId, dto);
  }

  @Patch(':wsId/members/:userId')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(WorkspaceRole.admin)
  updateMember(
    @CurrentUser() user: { userId: string },
    @Param('wsId', UuidValidationPipe) wsId: string,
    @Param('userId', UuidValidationPipe) memberUserId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.workspacesService.updateMemberRole(user.userId, wsId, memberUserId, dto);
  }

  @Delete(':wsId/members/:userId')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(WorkspaceRole.admin)
  removeMember(
    @CurrentUser() user: { userId: string },
    @Param('wsId', UuidValidationPipe) wsId: string,
    @Param('userId', UuidValidationPipe) memberUserId: string,
  ) {
    return this.workspacesService.removeMember(user.userId, wsId, memberUserId);
  }

  @Get(':wsId/activity')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(WorkspaceRole.viewer, WorkspaceRole.editor, WorkspaceRole.admin)
  activity(@CurrentUser() user: { userId: string }, @Param('wsId', UuidValidationPipe) wsId: string) {
    return this.workspacesService.activity(user.userId, wsId);
  }
}
