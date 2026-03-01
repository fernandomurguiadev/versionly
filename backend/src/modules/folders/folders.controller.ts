import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { FoldersService } from './folders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { UuidValidationPipe } from '../../common/pipes/uuid-validation.pipe';

@Controller()
@UseGuards(JwtAuthGuard)
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Get('projects/:projectId/folders')
  list(
    @CurrentUser() user: { userId: string },
    @Param('projectId', UuidValidationPipe) projectId: string,
    @Query('q') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.foldersService.listFolders(user.userId, projectId, search, page, limit, sortBy, sortOrder);
  }

  @Post('projects/:projectId/folders')
  create(
    @CurrentUser() user: { userId: string },
    @Param('projectId', UuidValidationPipe) projectId: string,
    @Body() dto: CreateFolderDto,
  ) {
    return this.foldersService.createFolder(user.userId, projectId, dto);
  }

  @Get('folders/:folderId')
  get(
    @CurrentUser() user: { userId: string },
    @Param('folderId', UuidValidationPipe) folderId: string,
  ) {
    return this.foldersService.getFolder(user.userId, folderId);
  }

  @Patch('folders/:folderId')
  update(
    @CurrentUser() user: { userId: string },
    @Param('folderId', UuidValidationPipe) folderId: string,
    @Body() dto: UpdateFolderDto,
  ) {
    return this.foldersService.updateFolder(user.userId, folderId, dto);
  }

  @Delete('folders/:folderId')
  remove(
    @CurrentUser() user: { userId: string },
    @Param('folderId', UuidValidationPipe) folderId: string,
  ) {
    return this.foldersService.deleteFolder(user.userId, folderId);
  }
}
