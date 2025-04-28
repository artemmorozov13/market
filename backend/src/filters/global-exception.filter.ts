import { 
    ExceptionFilter, 
    Catch, 
    ArgumentsHost, 
    Injectable 
} from '@nestjs/common';
import { TelegramErrorNotificationService } from 'src/telegram/telegram-error-notification.service';
  
@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    constructor(private readonly notificationService: TelegramErrorNotificationService) {}

    async catch(exception: Error, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        
        const context = {
        method: request.method,
        url: request.url,
        body: request.body,
        query: request.query,
        params: request.params,
        timestamp: new Date().toISOString(),
        };

        await this.notificationService.notifyError(exception, context);
        
        // Стандартная обработка ошибки
        const response = ctx.getResponse();
        const status = exception['status'] || 500;
        
        response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: exception.message || 'Internal server error',
        });
    }
}