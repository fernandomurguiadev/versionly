import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { DocumentAccessService } from '../../common/services/document-access.service';
import { UploadAssetDto } from './dto/upload-asset.dto';
import { StorageService } from '../../integrations/storage/storage.service';
import { randomUUID } from 'crypto';
import { PaginatedResponse } from '../../common/types/paginated-response.type';
import { DocumentRole } from '@prisma/client';

const MAX_ASSET_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']);

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: DocumentAccessService,
    private readonly storageService: StorageService,
  ) {}

  async list(
    userId: string,
    docId: string,
    page?: string,
    limit?: string,
    sortBy?: string,
    sortOrder?: string,
  ): Promise<
    PaginatedResponse<{
      id: string;
      documentId: string;
      filename: string;
      mimeType: string;
      sizeBytes: number;
      url: string;
      createdAt: Date;
    }>
  > {
    await this.accessService.getAccess(userId, docId);
    const pageValue = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
    const limitValue = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 100) : 20;
    const order: 'asc' | 'desc' = sortOrder === 'asc' ? 'asc' : 'desc';
    const allowedSort = new Set(['createdAt', 'filename']);
    const sortKey = allowedSort.has(sortBy ?? '') ? (sortBy as 'createdAt' | 'filename') : 'createdAt';
    const where = { documentId: docId };
    const total = await this.prisma.documentAsset.count({ where });
    const assets = await this.prisma.documentAsset.findMany({
      where,
      orderBy: { [sortKey]: order },
      skip: (pageValue - 1) * limitValue,
      take: limitValue,
    });

    return {
      data: assets.map((asset) => ({
        id: asset.id,
        documentId: asset.documentId,
        filename: asset.filename,
        mimeType: asset.mimeType,
        sizeBytes: asset.sizeBytes,
        url: this.storageService.getPublicUrl(asset.storageKey),
        createdAt: asset.createdAt,
      })),
      meta: {
        total,
        page: pageValue,
        limit: limitValue,
        totalPages: Math.ceil(total / limitValue),
      },
    };
  }

  async upload(userId: string, docId: string, dto: UploadAssetDto) {
    await this.accessService.assertEditor(userId, docId);

    if (!ALLOWED_MIME.has(dto.mimeType)) {
      throw new BadRequestException('Tipo de archivo no permitido.');
    }

    const buffer = Buffer.from(dto.contentBase64, 'base64');
    if (buffer.length === 0) {
      throw new BadRequestException('Archivo vacío.');
    }
    if (buffer.length > MAX_ASSET_SIZE) {
      throw new BadRequestException('Archivo supera el tamaño permitido.');
    }

    const assetId = randomUUID();
    const storageKey = `documents/${docId}/assets/${assetId}-${dto.filename}`;
    await this.storageService.upload(storageKey, buffer, dto.mimeType);

    return this.prisma.documentAsset.create({
      data: {
        id: assetId,
        documentId: docId,
        uploadedBy: userId,
        filename: dto.filename,
        storageKey,
        mimeType: dto.mimeType,
        sizeBytes: buffer.length,
      },
    });
  }

  async remove(userId: string, assetId: string) {
    const asset = await this.prisma.documentAsset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new NotFoundException('Asset no encontrado.');
    }

    const access = await this.accessService.getAccess(userId, asset.documentId);
    if (access.role !== DocumentRole.editor) {
      throw new ForbiddenException('No tienes permisos para eliminar el asset.');
    }

    await this.storageService.delete(asset.storageKey);
    await this.prisma.documentAsset.delete({ where: { id: assetId } });
    return { deleted: true };
  }
}
