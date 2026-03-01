import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { SharesService } from './shares.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateShareDto } from './dto/create-share.dto';
import { DocumentRole } from '@prisma/client';
import { DocumentRoles } from '../../common/decorators/document-roles.decorator';
import { DocumentRoleGuard } from '../../common/guards/document-role.guard';
import { UuidValidationPipe } from '../../common/pipes/uuid-validation.pipe';
import { FastifyRequest } from 'fastify';

@Controller()
export class SharesController {
  constructor(private readonly sharesService: SharesService) {}

  @Get('public/:token')
  resolve(@Param('token') token: string, @Req() request: FastifyRequest) {
    const forwarded = request.headers['x-forwarded-for'];
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return this.sharesService.resolve(token, {
      ipAddress: ip ?? request.ip ?? 'unknown',
      userAgent: request.headers['user-agent'] ?? null,
    });
  }

  @Get('documents/:docId/shares')
  @UseGuards(JwtAuthGuard)
  @UseGuards(DocumentRoleGuard)
  @DocumentRoles(DocumentRole.editor)
  list(
    @CurrentUser() user: { userId: string },
    @Param('docId', UuidValidationPipe) docId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.sharesService.list(docId, user.userId, page, limit, sortBy, sortOrder);
  }

  @Post('documents/:docId/shares')
  @UseGuards(JwtAuthGuard)
  @UseGuards(DocumentRoleGuard)
  @DocumentRoles(DocumentRole.editor)
  create(
    @CurrentUser() user: { userId: string },
    @Param('docId', UuidValidationPipe) docId: string,
    @Body() dto: CreateShareDto,
  ) {
    return this.sharesService.create(docId, user.userId, dto);
  }

  @Delete('shares/:shareId')
  @UseGuards(JwtAuthGuard)
  revoke(
    @CurrentUser() user: { userId: string },
    @Param('shareId', UuidValidationPipe) shareId: string,
  ) {
    return this.sharesService.revoke(shareId, user.userId);
  }
}
