import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  constructor(private readonly configService: ConfigService) {}

  async upload(key: string, buffer: Buffer, contentType: string) {
    void buffer;
    void contentType;
    return this.getPublicUrl(key);
  }

  async delete(key: string) {
    void key;
    return { deleted: true };
  }

  getPublicUrl(key: string) {
    const baseUrl = this.configService.get<string>('storage.publicUrl') ?? '';
    const normalized = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return normalized ? `${normalized}/${key}` : key;
  }
}
