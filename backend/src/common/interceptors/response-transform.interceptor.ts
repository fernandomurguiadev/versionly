import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  meta: { timestamp: string };
};

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((value: unknown): unknown => {
        if (value && typeof value === 'object' && 'success' in value) {
          return value;
        }

        if (value && typeof value === 'object' && 'subscribe' in value) {
          return value;
        }

        const response: ApiSuccessResponse<unknown> = {
          success: true,
          data: value,
          meta: { timestamp: new Date().toISOString() },
        };

        return response;
      }),
    );
  }
}
