import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { MoveDocumentDto } from './dto/move-document.dto';
import { DocumentMemberDto } from './dto/document-member.dto';
import { DocumentRole } from '@prisma/client';
import { DocumentRoles } from '../../common/decorators/document-roles.decorator';
import { DocumentRoleGuard } from '../../common/guards/document-role.guard';
import { UuidValidationPipe } from '../../common/pipes/uuid-validation.pipe';

@Controller()
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('folders/:folderId/documents')
  list(
    @CurrentUser() user: { userId: string },
    @Param('folderId', UuidValidationPipe) folderId: string,
    @Query('q') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.documentsService.listDocuments(user.userId, folderId, search, page, limit, sortBy, sortOrder);
  }

  @Post('folders/:folderId/documents')
  create(
    @CurrentUser() user: { userId: string },
    @Param('folderId', UuidValidationPipe) folderId: string,
    @Body() dto: CreateDocumentDto,
  ) {
    return this.documentsService.createDocument(user.userId, folderId, dto);
  }

  @Get('documents/:docId')
  @UseGuards(DocumentRoleGuard)
  @DocumentRoles(DocumentRole.viewer, DocumentRole.editor)
  get(@CurrentUser() user: { userId: string }, @Param('docId', UuidValidationPipe) docId: string) {
    return this.documentsService.getDocument(user.userId, docId);
  }

  @Get('documents/:docId/content')
  @UseGuards(DocumentRoleGuard)
  @DocumentRoles(DocumentRole.viewer, DocumentRole.editor)
  getContent(@CurrentUser() user: { userId: string }, @Param('docId', UuidValidationPipe) docId: string) {
    return this.documentsService.getDocumentContent(user.userId, docId);
  }

  @Patch('documents/:docId')
  @UseGuards(DocumentRoleGuard)
  @DocumentRoles(DocumentRole.editor)
  update(
    @CurrentUser() user: { userId: string },
    @Param('docId', UuidValidationPipe) docId: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentsService.updateDocument(user.userId, docId, dto);
  }

  @Delete('documents/:docId')
  @UseGuards(DocumentRoleGuard)
  @DocumentRoles(DocumentRole.editor)
  remove(
    @CurrentUser() user: { userId: string },
    @Param('docId', UuidValidationPipe) docId: string,
    @Query('confirm') confirm?: string,
  ) {
    return this.documentsService.deleteDocument(user.userId, docId, confirm);
  }

  @Patch('documents/:docId/move')
  @UseGuards(DocumentRoleGuard)
  @DocumentRoles(DocumentRole.editor)
  move(
    @CurrentUser() user: { userId: string },
    @Param('docId', UuidValidationPipe) docId: string,
    @Body() dto: MoveDocumentDto,
  ) {
    return this.documentsService.moveDocument(user.userId, docId, dto);
  }

  @Get('documents/:docId/members')
  @UseGuards(DocumentRoleGuard)
  @DocumentRoles(DocumentRole.editor)
  listMembers(@CurrentUser() user: { userId: string }, @Param('docId', UuidValidationPipe) docId: string) {
    return this.documentsService.listMembers(user.userId, docId);
  }

  @Post('documents/:docId/members')
  @UseGuards(DocumentRoleGuard)
  @DocumentRoles(DocumentRole.editor)
  addMember(
    @CurrentUser() user: { userId: string },
    @Param('docId', UuidValidationPipe) docId: string,
    @Body() dto: DocumentMemberDto,
  ) {
    return this.documentsService.addMember(user.userId, docId, dto);
  }

  @Patch('documents/:docId/members/:userId')
  @UseGuards(DocumentRoleGuard)
  @DocumentRoles(DocumentRole.editor)
  updateMember(
    @CurrentUser() user: { userId: string },
    @Param('docId', UuidValidationPipe) docId: string,
    @Param('userId', UuidValidationPipe) userId: string,
    @Body() dto: DocumentMemberDto,
  ) {
    return this.documentsService.updateMember(user.userId, docId, userId, dto);
  }

  @Delete('documents/:docId/members/:userId')
  @UseGuards(DocumentRoleGuard)
  @DocumentRoles(DocumentRole.editor)
  removeMember(
    @CurrentUser() user: { userId: string },
    @Param('docId', UuidValidationPipe) docId: string,
    @Param('userId', UuidValidationPipe) userId: string,
  ) {
    return this.documentsService.removeMember(user.userId, docId, userId);
  }
}
