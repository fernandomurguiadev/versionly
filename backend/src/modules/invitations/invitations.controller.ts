import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UuidValidationPipe } from '../../common/pipes/uuid-validation.pipe';

@Controller()
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post('workspaces/:wsId/invitations')
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: { userId: string },
    @Param('wsId', UuidValidationPipe) wsId: string,
    @Body() dto: CreateInvitationDto,
  ) {
    return this.invitationsService.create(wsId, user.userId, dto);
  }

  @Get('invitations/:token')
  validate(@Param('token') token: string) {
    return this.invitationsService.validate(token);
  }

  @Post('invitations/:token/accept')
  @UseGuards(JwtAuthGuard)
  accept(@CurrentUser() user: { userId: string }, @Param('token') token: string) {
    return this.invitationsService.accept(token, user.userId);
  }

  @Delete('workspaces/:wsId/invitations/:id')
  @UseGuards(JwtAuthGuard)
  cancel(
    @CurrentUser() user: { userId: string },
    @Param('wsId', UuidValidationPipe) wsId: string,
    @Param('id', UuidValidationPipe) id: string,
  ) {
    return this.invitationsService.cancel(wsId, id, user.userId);
  }
}
