import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UploadAssetDto } from './dto/upload-asset.dto';
import { DocumentRole } from '@prisma/client';
import { DocumentRoles } from '../../common/decorators/document-roles.decorator';
import { DocumentRoleGuard } from '../../common/guards/document-role.guard';
import { UuidValidationPipe } from '../../common/pipes/uuid-validation.pipe';

@Controller()
@UseGuards(JwtAuthGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get('documents/:docId/assets')
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
    return this.assetsService.list(user.userId, docId, page, limit, sortBy, sortOrder);
  }

  @Post('documents/:docId/assets')
  @UseGuards(DocumentRoleGuard)
  @DocumentRoles(DocumentRole.editor)
  upload(
    @CurrentUser() user: { userId: string },
    @Param('docId', UuidValidationPipe) docId: string,
    @Body() dto: UploadAssetDto,
  ) {
    return this.assetsService.upload(user.userId, docId, dto);
  }

  @Delete('assets/:assetId')
  remove(@CurrentUser() user: { userId: string }, @Param('assetId', UuidValidationPipe) assetId: string) {
    return this.assetsService.remove(user.userId, assetId);
  }
}
