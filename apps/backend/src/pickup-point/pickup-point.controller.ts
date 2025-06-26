import { Controller, Get, Post, Body, Param, Put, Delete, Patch, UseGuards, Query } from '@nestjs/common';
import { PickupPointService } from './pickup-point.service';
import { CreatePickupPointDto } from './dto/create-pickup-point.dto';
import { UpdatePickupPointDto } from './dto/update-pickup-point.dto';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { Roles } from '@core/enums/role-enum';
import { PickupPoint } from '@core/entities/pickup-point.entity';
import { User } from '@app/decorators/user.decorator';
import { AuthJwtPayload } from '@core/types/user-type';
import { DeliveryTimesService } from '@app/delivery-times/delivery-times.service';
import { FindPickupPointDto } from './dto/find-pickup-point-body';

@Controller('pickup-points')
export class PickupPointController {
  constructor(
    private readonly pickupPointService: PickupPointService,
    private readonly deliveryTimeService: DeliveryTimesService
  ) {}

  @Post('create')
  @AllowRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  create(
    @User() user: AuthJwtPayload,
    @Body() createDto: CreatePickupPointDto
  ): Promise<PickupPoint> {
    return this.pickupPointService.create(user, createDto);
  }

  @AllowRoles(Roles.Admin, Roles.User, Roles.SuperAdmin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get(':id/available-times')
  async getAvailableTimes(
    @User() user: AuthJwtPayload,
    @Param('id') id: number
  ) {
    return this.deliveryTimeService.getAvailableDeliveryTimes(
      id,
      user,
      { includePassedTimes: false }
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  findAll(
    @User() user: AuthJwtPayload,
    @Body() body: FindPickupPointDto
  ): Promise<PickupPoint[]> {
    return this.pickupPointService.findAll(user, body);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(
    @User() user: AuthJwtPayload,
    @Param('id') id: string
  ): Promise<PickupPoint> {
    return this.pickupPointService.findOne(user, Number(id));
  }
  
  @Put(':id')
  @AllowRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  update(
    @User() user: AuthJwtPayload,
    @Param('id') id: string,
    @Body() updateDto: UpdatePickupPointDto,
  ): Promise<PickupPoint> {
    return this.pickupPointService.update(user, Number(id), updateDto);
  }

  @Patch(':id')
  @AllowRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  partialUpdate(
    @User() user: AuthJwtPayload,
    @Param('id') id: string,
    @Body() updateDto: UpdatePickupPointDto,
  ): Promise<PickupPoint> {
    return this.pickupPointService.update(user, Number(id), updateDto);
  }

  @Delete(':id')
  @AllowRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  remove(
    @User() user: AuthJwtPayload,
    @Param('id') id: string
  ) {
    return this.pickupPointService.remove(user, Number(id));
  }
}