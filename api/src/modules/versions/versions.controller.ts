import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { VersionsService } from './versions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateVersionDto } from './dto/create-version.dto';
import { DocumentRole } from '@prisma/client';
import { DocumentRoles } from '../../common/decorators/document-roles.decorator';
import { DocumentRoleGuard } from '../../common/guards/document-role.guard';
import { UuidValidationPipe } from '../../common/pipes/uuid-validation.pipe';

@Controller()
@UseGuards(JwtAuthGuard)
export class VersionsController {
  constructor(private readonly versionsService: VersionsService) {}

  @Get('documents/:docId/versions')
  @UseGuards(DocumentRoleGuard)
  @DocumentRoles(DocumentRole.viewer, DocumentRole.editor)
  list(
    @CurrentUser() user: { userId: string },
    @Param('docId', UuidValidationPipe) docId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.versionsService.listVersions(user.userId, docId, page, limit, sortBy, sortOrder);
  }

  @Post('documents/:docId/versions')
  @UseGuards(DocumentRoleGuard)
  @DocumentRoles(DocumentRole.editor)
  create(
    @CurrentUser() user: { userId: string },
    @Param('docId', UuidValidationPipe) docId: string,
    @Body() dto: CreateVersionDto,
  ) {
    return this.versionsService.createVersion(user.userId, docId, dto);
  }

  @Get('versions/:versionId')
  get(
    @CurrentUser() user: { userId: string },
    @Param('versionId', UuidValidationPipe) versionId: string,
  ) {
    return this.versionsService.getVersion(user.userId, versionId);
  }

  @Delete('versions/:versionId')
  remove(
    @CurrentUser() user: { userId: string },
    @Param('versionId', UuidValidationPipe) versionId: string,
  ) {
    return this.versionsService.deleteVersion(user.userId, versionId);
  }

  @Post('versions/:versionId/set-current')
  setCurrent(
    @CurrentUser() user: { userId: string },
    @Param('versionId', UuidValidationPipe) versionId: string,
  ) {
    return this.versionsService.setCurrent(user.userId, versionId);
  }
}
