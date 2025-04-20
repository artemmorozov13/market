import { Controller, Get, Query } from '@nestjs/common';
import { DadataService } from './dadata.service';

@Controller('dadata')
export class DadataController {
  constructor(private readonly dadataService: DadataService) {}

  @Get('suggest')
  async suggestAddress(@Query('query') query: string) {
    return this.dadataService.suggestAddress(query);
  }
}