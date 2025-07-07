import { Controller, Get, Post, Body, Param, Put, Delete, Patch, UseGuards, Query } from '@nestjs/common';
import { DeliveryAreaService } from './delivery-area.service';
import { CreateDeliveryAreaDto } from './dto/create-delivery-area.dto';
import { UpdateDeliveryAreaDto } from './dto/update-delivery-area.dto';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { Roles } from '@core/enums/role-enum';
import { DeliveryArea } from '@core/entities/delivery-area.entity';
import { User } from '@app/decorators/user.decorator';
import { AuthJwtPayload } from '@core/types/user-type';
import { DeliveryTimesService } from '@app/delivery-times/delivery-times.service';
import { FindDeliveryAreaDto } from './dto/find-delivery-area-body';
import { PostAvailableTimesDto } from './dto/post-available-times.dto';

@Controller('delivery-areas')
export class DeliveryAreaController {
  constructor(
    private readonly deliveryAreaService: DeliveryAreaService,
    private readonly deliveryTimeService: DeliveryTimesService
  ) {}

  @Post('create')
  @AllowRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  create(
    @User() user: AuthJwtPayload,
    @Body() createDto: CreateDeliveryAreaDto
  ): Promise<DeliveryArea> {
    return this.deliveryAreaService.create(user, createDto);
  }

  @AllowRoles(Roles.Admin, Roles.User, Roles.SuperAdmin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Post(':id/available-times')
  async getAvailableTimes(
    @User() user: AuthJwtPayload,
    @Param('id') id: number,
    @Body() body: PostAvailableTimesDto
  ) {
    return this.deliveryTimeService.getAvailableDeliveryTimes(
      id,
      user,
      body,
      { includePassedTimes: false }
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  findAll(
    @User() user: AuthJwtPayload,
    @Body() body: FindDeliveryAreaDto
  ): Promise<DeliveryArea[]> {
    return this.deliveryAreaService.findAll(user, body);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(
    @User() user: AuthJwtPayload,
    @Param('id') id: string
  ): Promise<DeliveryArea> {
    return this.deliveryAreaService.findOne(user, Number(id));
  }
  
  @Put(':id')
  @AllowRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  update(
    @User() user: AuthJwtPayload,
    @Param('id') id: string,
    @Body() updateDto: UpdateDeliveryAreaDto,
  ): Promise<DeliveryArea> {
    return this.deliveryAreaService.update(user, Number(id), updateDto);
  }

  @Patch(':id')
  @AllowRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  partialUpdate(
    @User() user: AuthJwtPayload,
    @Param('id') id: string,
    @Body() updateDto: UpdateDeliveryAreaDto,
  ): Promise<DeliveryArea> {
    return this.deliveryAreaService.update(user, Number(id), updateDto);
  }

  @Delete(':id')
  @AllowRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  remove(
    @User() user: AuthJwtPayload,
    @Param('id') id: string
  ) {
    return this.deliveryAreaService.remove(user, Number(id));
  }
}