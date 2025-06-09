import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    HttpException,
    HttpStatus,
    UseGuards,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { FileUploaderService } from './file-uploader.service';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { Roles } from '@core/enums/role-enum';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
  
  @Controller('file-uploader')
  export class FileUploaderController {
    constructor(private readonly fileUploaderService: FileUploaderService) {}
  
    @Post('upload')
    @AllowRoles(Roles.Admin, Roles.User)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
      if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }
  
      // Проверка типа файла
      if (!file.mimetype.match(/(jpg|jpeg|png|gif)$/)) {
        throw new HttpException(
          'Only image files (jpg, jpeg, png, gif) are allowed',
          HttpStatus.BAD_REQUEST,
        );
      }
  
      // Проверка размера файла (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new HttpException(
          'File size exceeds 5MB limit',
          HttpStatus.BAD_REQUEST,
        );
      }
  
      try {
        const fileUrl = await this.fileUploaderService.uploadFile(file);
        
        return {
          success: true,
          message: 'File uploaded successfully to TimeWeb S3',
          url: fileUrl,
          filename: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
        };
      } catch (error) {
        throw new HttpException(
          `File upload failed: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }