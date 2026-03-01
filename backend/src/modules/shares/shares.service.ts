import { ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { DocumentAccessService } from '../../common/services/document-access.service';
import { CreateShareDto } from './dto/create-share.dto';
import { randomBytes, randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { PaginatedResponse } from '../../common/types/paginated-response.type';

@Injectable()
export class SharesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: DocumentAccessService,
    private readonly configService: ConfigService,
  ) {}

  async create(docId: string, userId: string, dto: CreateShareDto) {
    await this.accessService.assertEditor(userId, docId);

    if (dto.mode === 'fixed' && !dto.versionId) {
      throw new ForbiddenException('Se requiere versionId para compartir fijo.');
    }

    const share = await this.prisma.sharedLink.create({
      data: {
        id: randomUUID(),
        documentId: docId,
        versionId: dto.mode === 'fixed' ? dto.versionId ?? null : null,
        token: randomBytes(32).toString('hex'),
        mode: dto.mode,
        allowHistory: dto.allowHistory ?? false,
        createdBy: userId,
      },
      include: { createdByUser: { select: { id: true, fullName: true } } },
    });

    return this.mapShare(share);
  }

  async list(
    docId: string,
    userId: string,
    page?: string,
    limit?: string,
    sortBy?: string,
    sortOrder?: string,
  ): Promise<
    PaginatedResponse<{
      id: string;
      token: string;
      url: string;
      mode: string;
      allowHistory: boolean;
      versionId: string | null;
      createdBy: { id: string; fullName: string | null } | null;
      createdAt: Date;
      revokedAt: Date | null;
    }>
  > {
    await this.accessService.assertEditor(userId, docId);
    const pageValue = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
    const limitValue = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 100) : 20;
    const order: 'asc' | 'desc' = sortOrder === 'asc' ? 'asc' : 'desc';
    const allowedSort = new Set(['createdAt']);
    const sortKey = allowedSort.has(sortBy ?? '') ? 'createdAt' : 'createdAt';
    const where = { documentId: docId };
    const total = await this.prisma.sharedLink.count({ where });
    const shares = await this.prisma.sharedLink.findMany({
      where,
      include: { createdByUser: { select: { id: true, fullName: true } } },
      orderBy: { [sortKey]: order },
      skip: (pageValue - 1) * limitValue,
      take: limitValue,
    });
    return {
      data: shares.map((share) => this.mapShare(share)),
      meta: {
        total,
        page: pageValue,
        limit: limitValue,
        totalPages: Math.ceil(total / limitValue),
      },
    };
  }

  async revoke(shareId: string, userId: string) {
    const share = await this.prisma.sharedLink.findUnique({
      where: { id: shareId },
      select: { id: true, documentId: true },
    });

    if (!share) {
      throw new NotFoundException('Share no encontrado.');
    }

    await this.accessService.assertEditor(userId, share.documentId);
    return this.prisma.sharedLink.update({
      where: { id: shareId },
      data: { revokedAt: new Date() },
    });
  }

  async resolve(token: string, access: { ipAddress: string; userAgent: string | null }) {
    const share = await this.prisma.sharedLink.findFirst({
      where: { token, revokedAt: null },
      include: { document: true },
    });

    if (!share) {
      throw new NotFoundException('Share no encontrado.');
    }

    await this.prisma.sharedLinkAccessLog.create({
      data: {
        id: randomUUID(),
        sharedLinkId: share.id,
        ipAddress: access.ipAddress,
        userAgent: access.userAgent ?? undefined,
      },
    });

    const version = share.mode === 'dynamic'
      ? await this.prisma.documentVersion.findFirst({
          where: { documentId: share.documentId, isCurrent: true },
        })
      : await this.prisma.documentVersion.findUnique({
          where: { id: share.versionId ?? '' },
        });

    if (!version) {
      throw new HttpException('VERSION_DELETED', HttpStatus.GONE);
    }

    return {
      documentTitle: share.document.title,
      versionName: version.name,
      versionContent: version.content as Record<string, unknown>,
      allowHistory: share.allowHistory,
      mode: share.mode,
    };
  }

  private mapShare(share: {
    id: string;
    token: string;
    mode: string;
    allowHistory: boolean;
    versionId: string | null;
    createdAt: Date;
    revokedAt: Date | null;
    createdByUser: { id: string; fullName: string | null } | null;
  }) {
    const baseUrl = this.configService.get<string>('app.frontendUrl') ?? '';
    const normalized = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return {
      id: share.id,
      token: share.token,
      url: normalized ? `${normalized}/s/${share.token}` : `/s/${share.token}`,
      mode: share.mode,
      allowHistory: share.allowHistory,
      versionId: share.versionId,
      createdBy: share.createdByUser,
      createdAt: share.createdAt,
      revokedAt: share.revokedAt,
    };
  }
}
