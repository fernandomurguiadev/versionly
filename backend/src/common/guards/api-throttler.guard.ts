import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ApiThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const user = req['user'] as { userId?: string } | undefined;
    if (user?.userId) {
      return `user:${user.userId}`;
    }

    const ip = (req as { ip?: string }).ip;
    const forwarded = (req as { headers?: Record<string, string | string[] | undefined> }).headers?.['x-forwarded-for'];
    const resolved = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return `ip:${resolved ?? ip ?? 'unknown'}`;
  }

  protected getLimit(context: ExecutionContext): number {
    const request = context.switchToHttp().getRequest<{ user?: { userId?: string } }>();
    return request.user?.userId ? 300 : 100;
  }

  protected getTtl(context: ExecutionContext): number {
    context.switchToHttp();
    return 60;
  }
}
