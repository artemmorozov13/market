import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { OfferedProductsService } from './offered-products.service';
import { CreateOfferedProductDto } from './dto/create-offered-product.dto';
import { UpdateOfferedProductDto } from './dto/update-offered-product.dto';
import { AllowRoles } from '@app/auth/decorators/roles.decorator';
import { Roles } from '@core/enums/role-enum';
import { RolesGuard } from '@app/auth/guards/roles/roles.guard';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth/jwt-auth.guard';
import { User } from '@app/decorators/user.decorator';
import { AuthJwtPayload } from '@core/types/user-type';
import { RejectOfferedProductDto } from './dto/reject-offered-product.dto';

@Controller('offered-products')
export class OfferedProductsController {
  constructor(private readonly orderedProductsService: OfferedProductsService) {}

  @AllowRoles(Roles.Vendor)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @User() user: AuthJwtPayload,
    @Body() createDto: CreateOfferedProductDto
  ) {
    return await this.orderedProductsService.create(user, createDto);
  }

  @AllowRoles(Roles.Vendor, Roles.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@User() user: AuthJwtPayload) {
    return await this.orderedProductsService.findAll(user);
  }

  @AllowRoles(Roles.Vendor, Roles.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.orderedProductsService.findOne(+id);
  }

  @AllowRoles(Roles.Vendor, Roles.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateOfferedProductDto,
    @User() user: AuthJwtPayload
  ) {
    return await this.orderedProductsService.update(+id, updateDto, user);
  }

  @AllowRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Patch(':id/accept')
  async accept(
    @Param('id') id: string,
    @User() user: AuthJwtPayload
  ) {
    return await this.orderedProductsService.acceptProduct(+id, user);
  }

  @AllowRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Patch(':id/reject')
  async cancel(
    @User() user: AuthJwtPayload,
    @Param('id') id: string,
    @Body() body: RejectOfferedProductDto
  ) {
    return await this.orderedProductsService.cancelProduct(+id, user, body.comment);
  }

  @AllowRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Patch(':id/hidden')
  async hidden(
    @User() user: AuthJwtPayload,
    @Param('id') id: string,
  ) {
    return await this.orderedProductsService.hiddenProduct(+id, user);
  }

  @AllowRoles(Roles.Vendor, Roles.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @User() user: AuthJwtPayload,
  ) {
    return await this.orderedProductsService.remove(+id, user);
  }
}