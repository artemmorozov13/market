import { 
    ExceptionFilter, 
    Catch, 
    ArgumentsHost, 
    Injectable,
    HttpException,
    HttpStatus
} from '@nestjs/common';
import { TelegramErrorNotificationService } from 'src/telegram/telegram-error-notification.service';
  
@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    constructor(private readonly notificationService: TelegramErrorNotificationService) {}

    async catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        
        // Определяем статус код
        const status = 
            exception instanceof HttpException 
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;
        
        // Определяем сообщение
        const message = 
            exception instanceof Error 
                ? exception.message
                : 'Internal server error';

        // Отправляем уведомление только для 5xx ошибок
        if (status >= 500) {
            try {
                const context = {
                    method: request.method,
                    url: request.url,
                    body: JSON.stringify(request.body),
                    query: JSON.stringify(request.query),
                    params: JSON.stringify(request.params),
                    timestamp: new Date().toISOString(),
                };
        
                await this.notificationService.notifyError(
                    exception instanceof Error ? exception : new Error(message),
                    context
                );
            } catch (telegramError) {
                console.error('Failed to send Telegram notification:', telegramError);
            }
        }
        
        // Отправляем ответ клиенту
        response.status(status).json({
            statusCode: status,
            message: message,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}