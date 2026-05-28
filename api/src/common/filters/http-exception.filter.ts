import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus?.() ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = exception.getResponse?.();

    const message =
      typeof payload === 'string'
        ? payload
        : typeof payload === 'object' && payload && 'message' in payload
          ? Array.isArray((payload as { message?: string[] }).message)
            ? (payload as { message?: string[] }).message?.join(', ')
            : (payload as { message?: string }).message
          : exception.message;

    response.status(status).send({
      success: false,
      error: {
        code: 'HTTP_EXCEPTION',
        message,
        statusCode: status,
      },
    });
  }
}
