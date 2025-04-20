import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: false,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const staticPath = path.join(__dirname, '..', 'src', 'static');

  app.useStaticAssets(staticPath, {
    prefix: '/static/',
  });
  console.log(process.env.PORT)
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();