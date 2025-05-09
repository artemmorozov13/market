import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DadataService } from './dadata.service';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/types/role-enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@Controller('dadata')
export class DadataController {
  constructor(private readonly dadataService: DadataService) {}

  @Get('suggest')
  @AllowRoles(Roles.Admin, Roles.User)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  async suggestAddress(@Query('query') query: string) {
    return this.dadataService.suggestAddress(query);
  }
}