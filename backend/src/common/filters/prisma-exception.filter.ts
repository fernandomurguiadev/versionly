import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const status = exception.code === 'P2002' ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST;
      response.status(status).send({
        success: false,
        error: {
          code: `PRISMA_${exception.code}`,
          message: exception.message,
          statusCode: status,
        },
      });
      return;
    }

    response.status(HttpStatus.BAD_REQUEST).send({
      success: false,
      error: {
        code: 'PRISMA_VALIDATION_ERROR',
        message: exception.message,
        statusCode: HttpStatus.BAD_REQUEST,
      },
    });
  }
}
