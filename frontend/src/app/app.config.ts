import { ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import {
  HttpBackend,
  HttpClient,
  HttpErrorResponse,
  HttpInterceptorFn,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

import { routes } from './app.routes';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }
  return next(req);
};

const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.headers.has('x-refresh-attempt')) {
    return next(req);
  }
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken || req.url.includes('/auth/refresh')) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }
      const httpBackend = inject(HttpBackend);
      const http = new HttpClient(httpBackend);
      const apiBase = 'http://localhost:3000/api/v1';
      return http.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(`${apiBase}/auth/refresh`, {
        refreshToken,
      }).pipe(
        switchMap((response) => {
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          return next(
            req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.data.accessToken}`,
                'x-refresh-attempt': 'true',
              },
            }),
          );
        }),
        catchError((refreshError) => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, refreshInterceptor])),
  ],
};
