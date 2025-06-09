import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DadataService } from './dadata.service';
import { DadataController } from './dadata.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    AuthModule,
    ConfigModule
  ],
  providers: [DadataService],
  controllers: [DadataController],
  exports: [DadataService],
})
export class DadataModule {}
