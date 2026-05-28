import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const statusMap: Record<string, number> = {
        P2002: HttpStatus.CONFLICT,           // Unique constraint violation
        P2025: HttpStatus.NOT_FOUND,          // Record not found
        P2003: HttpStatus.CONFLICT,           // FK constraint violation
        P2016: HttpStatus.BAD_REQUEST,        // Query interpretation error
      };
      const status = statusMap[exception.code] ?? HttpStatus.BAD_REQUEST;
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
