import { Injectable } from '@nestjs/common';

type WritableResponse = NodeJS.WritableStream;

@Injectable()
export class SseService {
  private readonly connections = new Map<string, Set<WritableResponse>>();

  addConnection(userId: string, response: WritableResponse) {
    const existing = this.connections.get(userId);
    if (existing) {
      existing.add(response);
      return;
    }
    this.connections.set(userId, new Set([response]));
  }

  removeConnection(userId: string, response: WritableResponse) {
    const existing = this.connections.get(userId);
    if (!existing) {
      return;
    }
    existing.delete(response);
    if (existing.size === 0) {
      this.connections.delete(userId);
    }
  }

  emit(userId: string, event: unknown) {
    const connections = this.connections.get(userId);
    if (!connections) {
      return;
    }
    const payload = `data: ${JSON.stringify(event)}\n\n`;
    connections.forEach((res) => res.write(payload));
  }
}
