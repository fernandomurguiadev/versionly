import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { MergeService } from './merge.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateMergeDto } from './dto/create-merge.dto';
import { DocumentRole } from '@prisma/client';
import { DocumentRoles } from '../../common/decorators/document-roles.decorator';
import { DocumentRoleGuard } from '../../common/guards/document-role.guard';
import { UuidValidationPipe } from '../../common/pipes/uuid-validation.pipe';

@Controller()
@UseGuards(JwtAuthGuard)
export class MergeController {
  constructor(private readonly mergeService: MergeService) {}

  @Get('documents/:docId/conflicts')
  @UseGuards(DocumentRoleGuard)
  @DocumentRoles(DocumentRole.editor)
  getConflicts(@CurrentUser() user: { userId: string }, @Param('docId', UuidValidationPipe) docId: string) {
    return this.mergeService.getConflicts(user.userId, docId);
  }

  @Post('documents/:docId/merge')
  @UseGuards(DocumentRoleGuard)
  @DocumentRoles(DocumentRole.editor)
  createMerge(
    @CurrentUser() user: { userId: string },
    @Param('docId', UuidValidationPipe) docId: string,
    @Body() dto: CreateMergeDto,
  ) {
    return this.mergeService.createMerge(user.userId, docId, dto);
  }
}
