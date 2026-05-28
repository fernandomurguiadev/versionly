import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { DocumentAccessService } from '../../common/services/document-access.service';
import { CreateMergeDto } from './dto/create-merge.dto';
import { Prisma, VersionSource } from '@prisma/client';
import { randomUUID } from 'crypto';
import { VersionsService } from '../versions/versions.service';

@Injectable()
export class MergeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: DocumentAccessService,
    private readonly versionsService: VersionsService,
  ) {}

  async getConflicts(userId: string, docId: string) {
    await this.accessService.assertEditor(userId, docId);
    const versions = await this.prisma.documentVersion.findMany({
      where: {
        documentId: docId,
        basedOnVersionId: { not: null },
      },
      include: { createdByUser: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const grouped = new Map<string, typeof versions>();
    versions.forEach((version) => {
      const key = version.basedOnVersionId ?? '';
      const bucket = grouped.get(key) ?? [];
      bucket.push(version);
      grouped.set(key, bucket);
    });

    return Array.from(grouped.entries())
      .filter(([, bucket]) => bucket.length > 1)
      .map(([basedOnVersionId, bucket]) => ({
        basedOnVersionId,
        versions: bucket.map((version) => ({
          id: version.id,
          name: version.name,
          createdAt: version.createdAt,
          createdBy: version.createdByUser,
        })),
      }));
  }

  async createMerge(userId: string, docId: string, dto: CreateMergeDto) {
    await this.accessService.assertEditor(userId, docId);
    const version = await this.prisma.documentVersion.create({
      data: {
        id: randomUUID(),
        documentId: docId,
        name: dto.name,
        comment: dto.comment,
        content: dto.content as Prisma.InputJsonValue,
        createdBy: userId,
        source: VersionSource.merge,
        mergeFromA: dto.mergeFromA,
        mergeFromB: dto.mergeFromB,
        isCurrent: false,
      },
    });

    if (dto.markAsCurrent) {
      await this.versionsService.setCurrent(userId, version.id);
    }

    return version;
  }
}
