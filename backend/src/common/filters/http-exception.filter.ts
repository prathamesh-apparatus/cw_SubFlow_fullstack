import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const raw: any = exception instanceof HttpException ? exception.getResponse() : null;
    const message = typeof raw === 'string' ? raw : raw?.message || (exception as Error)?.message || 'Internal server error';
    res.status(status).json({ success: false, statusCode: status, message, data: null });
  }
}
