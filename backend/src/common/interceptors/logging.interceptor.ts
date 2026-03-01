import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<{ method?: string; url?: string }>();
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = http.getResponse<{ statusCode?: number }>();
          const statusCode = response?.statusCode ?? 200;
          const durationMs = Date.now() - start;
          this.logger.log(`${request?.method ?? 'REQ'} ${request?.url ?? ''} ${statusCode} ${durationMs}ms`);
        },
        error: (error) => {
          const response = http.getResponse<{ statusCode?: number }>();
          const statusCode = response?.statusCode ?? 500;
          const durationMs = Date.now() - start;
          const message = error instanceof Error ? error.message : 'Error';
          this.logger.error(
            `${request?.method ?? 'REQ'} ${request?.url ?? ''} ${statusCode} ${durationMs}ms - ${message}`,
          );
        },
      }),
    );
  }
}
