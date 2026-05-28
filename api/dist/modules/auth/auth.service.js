"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../integrations/prisma/prisma.service");
const crypto_1 = require("crypto");
const bcrypt = require("bcrypt");
let AuthService = class AuthService {
    constructor(prisma, jwtService, config) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.config = config;
    }
    async register(dto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
            select: { id: true },
        });
        if (existing) {
            throw new common_1.BadRequestException('El email ya está registrado.');
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.user.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
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
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            select: { id: true, email: true, passwordHash: true, fullName: true, emailVerifiedAt: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales inválidas.');
        }
        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!valid) {
            throw new common_1.UnauthorizedException('Credenciales inválidas.');
        }
        if (!user.emailVerifiedAt) {
            throw new common_1.ForbiddenException('EMAIL_NOT_VERIFIED');
        }
        const tokens = await this.issueTokens(user.id, user.email);
        return {
            user: { id: user.id, email: user.email, fullName: user.fullName },
            ...tokens,
        };
    }
    async refresh(dto) {
        const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
            secret: this.config.get('jwt.refreshSecret'),
        });
        const stored = await this.prisma.refreshToken.findFirst({
            where: {
                token: dto.refreshToken,
                revokedAt: null,
            },
            select: { id: true, userId: true, expiresAt: true },
        });
        if (!stored || stored.userId !== payload.sub || stored.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Refresh token inválido.');
        }
        await this.prisma.refreshToken.update({
            where: { id: stored.id },
            data: { revokedAt: new Date() },
        });
        return this.issueTokens(payload.sub, payload.email);
    }
    async logout(refreshToken) {
        if (!refreshToken) {
            throw new common_1.BadRequestException('Refresh token requerido.');
        }
        await this.prisma.refreshToken.updateMany({
            where: { token: refreshToken, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        return { revoked: true };
    }
    async forgotPassword(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            select: { id: true },
        });
        if (!user) {
            return { requested: true };
        }
        const token = `reset:${(0, crypto_1.randomUUID)()}`;
        const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
        await this.prisma.passwordResetToken.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                userId: user.id,
                token,
                expiresAt,
            },
        });
        return { requested: true };
    }
    async resetPassword(dto) {
        if (!dto.token.startsWith('reset:')) {
            throw new common_1.UnauthorizedException('Token inválido o expirado.');
        }
        const record = await this.prisma.passwordResetToken.findFirst({
            where: { token: dto.token, usedAt: null },
            select: { id: true, userId: true, expiresAt: true },
        });
        if (!record || record.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Token inválido o expirado.');
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
    async verifyEmail(dto) {
        if (!dto.token.startsWith('verify:')) {
            throw new common_1.UnauthorizedException('Token inválido o expirado.');
        }
        const record = await this.prisma.passwordResetToken.findFirst({
            where: { token: dto.token, usedAt: null },
            select: { id: true, userId: true, expiresAt: true },
        });
        if (!record || record.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Token inválido o expirado.');
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
    async resendVerification(dto) {
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
    async issueTokens(userId, email) {
        const accessToken = await this.jwtService.signAsync({ sub: userId, email }, {
            secret: this.config.get('jwt.accessSecret'),
            expiresIn: this.config.get('jwt.accessExpiresIn'),
        });
        const refreshToken = await this.jwtService.signAsync({ sub: userId, email }, {
            secret: this.config.get('jwt.refreshSecret'),
            expiresIn: this.config.get('jwt.refreshExpiresIn'),
        });
        const expiresAt = new Date(Date.now() + this.parseExpiresInToMs(this.config.get('jwt.refreshExpiresIn') ?? '7d'));
        await this.prisma.refreshToken.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                userId,
                token: refreshToken,
                expiresAt,
            },
        });
        return { accessToken, refreshToken };
    }
    async createEmailVerificationToken(userId) {
        const token = `verify:${(0, crypto_1.randomUUID)()}`;
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
        await this.prisma.passwordResetToken.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                userId,
                token,
                expiresAt,
            },
        });
        return token;
    }
    parseExpiresInToMs(value) {
        const match = /^(\d+)([smhd])$/.exec(value.trim());
        if (!match) {
            return 7 * 24 * 60 * 60 * 1000;
        }
        const amount = Number(match[1]);
        const unit = match[2];
        const multipliers = {
            s: 1000,
            m: 60 * 1000,
            h: 60 * 60 * 1000,
            d: 24 * 60 * 60 * 1000,
        };
        return amount * (multipliers[unit] ?? 1000);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map