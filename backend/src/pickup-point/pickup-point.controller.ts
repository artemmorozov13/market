import { Controller, Get, Post, Body, Param, Put, Delete, Patch, UseGuards } from '@nestjs/common';
import { PickupPointService } from './pickup-point.service';
import { CreatePickupPointDto } from './dto/create-pickup-point.dto';
import { PickupPoint } from '../entities/pickup-point.entity';
import { UpdatePickupPointDto } from './dto/update-pickup-point.dto';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { Roles } from 'src/auth/types/role-enum';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@Controller('pickup-points')
export class PickupPointController {
  constructor(private readonly pickupPointService: PickupPointService) {}

  @Post()
  @AllowRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  create(@Body() createDto: CreatePickupPointDto): Promise<PickupPoint> {
    return this.pickupPointService.create(createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(): Promise<PickupPoint[]> {
    return this.pickupPointService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string): Promise<PickupPoint> {
    return this.pickupPointService.findOne(+id);
  }
  
  @Put(':id')
  @AllowRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePickupPointDto,
  ): Promise<PickupPoint> {
    return this.pickupPointService.update(+id, updateDto);
  }

  @Patch(':id')
  @AllowRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  partialUpdate(
    @Param('id') id: string,
    @Body() updateDto: UpdatePickupPointDto,
  ): Promise<PickupPoint> {
    return this.pickupPointService.update(+id, updateDto);
  }

  @Delete(':id')
  @AllowRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.pickupPointService.remove(+id);
  }
}