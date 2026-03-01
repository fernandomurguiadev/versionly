import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { DraftsService } from './drafts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SaveDraftDto } from './dto/save-draft.dto';
import { DocumentRole } from '@prisma/client';
import { DocumentRoles } from '../../common/decorators/document-roles.decorator';
import { DocumentRoleGuard } from '../../common/guards/document-role.guard';
import { UuidValidationPipe } from '../../common/pipes/uuid-validation.pipe';

@Controller()
@UseGuards(JwtAuthGuard)
export class DraftsController {
  constructor(private readonly draftsService: DraftsService) {}

  @Get('documents/:docId/draft')
  @UseGuards(DocumentRoleGuard)
  @DocumentRoles(DocumentRole.editor)
  @Throttle({ default: { limit: 2, ttl: 1 } })
  get(@CurrentUser() user: { userId: string }, @Param('docId', UuidValidationPipe) docId: string) {
    return this.draftsService.getDraft(user.userId, docId);
  }

  @Put('documents/:docId/draft')
  @UseGuards(DocumentRoleGuard)
  @DocumentRoles(DocumentRole.editor)
  @Throttle({ default: { limit: 2, ttl: 1 } })
  save(
    @CurrentUser() user: { userId: string },
    @Param('docId', UuidValidationPipe) docId: string,
    @Body() dto: SaveDraftDto,
  ) {
    return this.draftsService.saveDraft(user.userId, docId, dto);
  }
}
