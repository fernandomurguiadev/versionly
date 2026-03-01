import { Body, Controller, Delete, Get, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: { userId: string }) {
    return this.usersService.getMe(user.userId);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: { userId: string }, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateMe(user.userId, dto);
  }

  @Patch('me/password')
  changePassword(@CurrentUser() user: { userId: string }, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.userId, dto);
  }

  @Delete('me/sessions')
  revokeSessions(@CurrentUser() user: { userId: string }) {
    return this.usersService.revokeAllSessions(user.userId);
  }
}
