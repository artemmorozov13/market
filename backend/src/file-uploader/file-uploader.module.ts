import { Module } from '@nestjs/common';
import { FileUploaderController } from './file-uploader.controller';
import { FileUploaderService } from './file-uploader.service';

@Module({
  imports: [],
  controllers: [FileUploaderController],
  providers: [FileUploaderService]
})
export class FileUploaderModule {}