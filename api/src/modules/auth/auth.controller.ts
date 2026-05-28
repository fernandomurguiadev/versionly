import { Body, Controller, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthForgotPasswordDto } from './dto/auth-forgot-password.dto';
import { AuthResetPasswordDto } from './dto/auth-reset-password.dto';
import { AuthVerifyEmailDto } from './dto/auth-verify-email.dto';
import { AuthResendVerificationDto } from './dto/auth-resend-verification.dto';

const REFRESH_COOKIE = 'refresh_token';

function cookieOptions(env: string | undefined) {
  return {
    httpOnly: true,
    secure: env === 'production',
    sameSite: (env === 'production' ? 'strict' : 'lax') as 'strict' | 'lax',
    path: '/api/v1/auth',
    maxAge: 7 * 24 * 60 * 60, // 7 días en segundos
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: AuthRegisterDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const result = await this.authService.register(dto);
    reply.setCookie(REFRESH_COOKIE, result.refreshToken, cookieOptions(process.env.NODE_ENV));
    return { user: result.user, accessToken: result.accessToken };
  }

  @Post('login')
  async login(
    @Body() dto: AuthLoginDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const result = await this.authService.login(dto);
    reply.setCookie(REFRESH_COOKIE, result.refreshToken, cookieOptions(process.env.NODE_ENV));
    return { user: result.user, accessToken: result.accessToken };
  }

  @Post('refresh')
  async refresh(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const token = (req.cookies as Record<string, string>)[REFRESH_COOKIE];
    if (!token) throw new UnauthorizedException('Refresh token no encontrado.');
    const result = await this.authService.refresh({ refreshToken: token });
    reply.setCookie(REFRESH_COOKIE, result.refreshToken, cookieOptions(process.env.NODE_ENV));
    return { accessToken: result.accessToken };
  }

  @Post('logout')
  async logout(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const token = (req.cookies as Record<string, string>)[REFRESH_COOKIE];
    if (token) {
      await this.authService.logout(token);
    }
    reply.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
    return { revoked: true };
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
