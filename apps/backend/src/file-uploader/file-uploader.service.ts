import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploaderService {
  private s3: AWS.S3;

  constructor(private configService: ConfigService) {
    // Инициализация S3 клиента с настройками TimeWeb
    this.s3 = new AWS.S3({
      endpoint: this.configService.get('S3_ENDPOINT'),
      region: this.configService.get('S3_REGION'),
      credentials: {
        accessKeyId: this.configService.get('S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get('S3_SECRET_KEY'),
      },
      s3ForcePathStyle: true, // Важно для TimeWeb S3
      signatureVersion: 'v4', // Рекомендуется для новых S3-совместимых хранилищ
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const bucketName = this.configService.get('S3_BUCKET_NAME');
    if (!bucketName) {
      throw new Error('S3 bucket name is not configured');
    }

    // Генерация уникального имени файла
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read', // Для публичного доступа к файлу
    };

    try {
      const result = await this.s3.upload(params).promise();
      return result.Location; // Возвращает публичный URL файла
    } catch (error) {
      console.error('TimeWeb S3 Upload Error:', {
        error: error.message,
        stack: error.stack,
        params: { ...params, Body: '[buffer]' }, // Не логируем содержимое файла
      });
      throw new Error(`Failed to upload file to TimeWeb S3: ${error.message}`);
    }
  }
}