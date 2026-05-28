import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthRefreshDto } from './dto/auth-refresh.dto';
import { AuthForgotPasswordDto } from './dto/auth-forgot-password.dto';
import { AuthResetPasswordDto } from './dto/auth-reset-password.dto';
import { AuthVerifyEmailDto } from './dto/auth-verify-email.dto';
import { AuthResendVerificationDto } from './dto/auth-resend-verification.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: AuthRegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: AuthLoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: AuthRefreshDto) {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  logout(@Body() dto: AuthRefreshDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: AuthForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('verify-email')
  verifyEmail(@Body() dto: AuthVerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('resend-verification')
  resendVerification(@Body() dto: AuthResendVerificationDto) {
    return this.authService.resendVerification(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: AuthResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
