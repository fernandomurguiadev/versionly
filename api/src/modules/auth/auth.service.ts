import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthRefreshDto } from './dto/auth-refresh.dto';
import { AuthForgotPasswordDto } from './dto/auth-forgot-password.dto';
import { AuthResetPasswordDto } from './dto/auth-reset-password.dto';
import { AuthVerifyEmailDto } from './dto/auth-verify-email.dto';
import { AuthResendVerificationDto } from './dto/auth-resend-verification.dto';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: AuthRegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existing) {
      throw new BadRequestException('El email ya está registrado.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        id: randomUUID(),
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
      },
    });

    await this.createEmailVerificationToken(user.id);
    const tokens = await this.issueTokens(user.id, user.email);

    return { user, ...tokens };
  }

  async login(dto: AuthLoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, email: true, passwordHash: true, fullName: true, emailVerifiedAt: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    if (!user.emailVerifiedAt) {
      throw new ForbiddenException('EMAIL_NOT_VERIFIED');
    }

    const tokens = await this.issueTokens(user.id, user.email);

    return {
      user: { id: user.id, email: user.email, fullName: user.fullName },
      ...tokens,
    };
  }

  async refresh(dto: AuthRefreshDto) {
    const payload = await this.jwtService.verifyAsync<{ sub: string; email: string }>(dto.refreshToken, {
      secret: this.config.get<string>('jwt.refreshSecret'),
    });

    const stored = await this.prisma.refreshToken.findFirst({
      where: {
        token: dto.refreshToken,
        revokedAt: null,
      },
      select: { id: true, userId: true, expiresAt: true },
    });

    if (!stored || stored.userId !== payload.sub || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido.');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(payload.sub, payload.email);
  }

  async logout(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token requerido.');
    }

    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { revoked: true };
  }

  async forgotPassword(dto: AuthForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (!user) {
      return { requested: true };
    }

    const token = `reset:${randomUUID()}`;
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await this.prisma.passwordResetToken.create({
      data: {
        id: randomUUID(),
        userId: user.id,
        token,
        expiresAt,
      },
    });

    return { requested: true };
  }

  async resetPassword(dto: AuthResetPasswordDto) {
    if (!dto.token.startsWith('reset:')) {
      throw new UnauthorizedException('Token inválido o expirado.');
    }
    const record = await this.prisma.passwordResetToken.findFirst({
      where: { token: dto.token, usedAt: null },
      select: { id: true, userId: true, expiresAt: true },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Token inválido o expirado.');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { reset: true };
  }

  async verifyEmail(dto: AuthVerifyEmailDto) {
    if (!dto.token.startsWith('verify:')) {
      throw new UnauthorizedException('Token inválido o expirado.');
    }

    const record = await this.prisma.passwordResetToken.findFirst({
      where: { token: dto.token, usedAt: null },
      select: { id: true, userId: true, expiresAt: true },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Token inválido o expirado.');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { emailVerifiedAt: new Date() },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { verified: true };
  }

  async resendVerification(dto: AuthResendVerificationDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, emailVerifiedAt: true },
    });

    if (!user || user.emailVerifiedAt) {
      return { resent: true };
    }

    await this.createEmailVerificationToken(user.id);
    return { resent: true };
  }

  private async issueTokens(userId: string, email: string): Promise<Tokens> {
    const accessToken = await this.jwtService.signAsync(
      { sub: userId, email },
      {
        secret: this.config.get<string>('jwt.accessSecret'),
        expiresIn: this.config.get<string>('jwt.accessExpiresIn'),
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, email },
      {
        secret: this.config.get<string>('jwt.refreshSecret'),
        expiresIn: this.config.get<string>('jwt.refreshExpiresIn'),
      },
    );

    const expiresAt = new Date(
      Date.now() + this.parseExpiresInToMs(this.config.get<string>('jwt.refreshExpiresIn') ?? '7d'),
    );

    await this.prisma.refreshToken.create({
      data: {
        id: randomUUID(),
        userId,
        token: refreshToken,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private async createEmailVerificationToken(userId: string) {
    const token = `verify:${randomUUID()}`;
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await this.prisma.passwordResetToken.create({
      data: {
        id: randomUUID(),
        userId,
        token,
        expiresAt,
      },
    });

    return token;
  }

  private parseExpiresInToMs(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value.trim());
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }
    const amount = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return amount * (multipliers[unit] ?? 1000);
  }
}
