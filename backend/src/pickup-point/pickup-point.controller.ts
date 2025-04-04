import { Controller, Get, Post, Body, Param, Put, Delete, Patch } from '@nestjs/common';
import { PickupPointService } from './pickup-point.service';
import { CreatePickupPointDto } from './dto/create-pickup-point.dto';
import { PickupPoint } from '../entities/pickup-point.entity';
import { UpdatePickupPointDto } from './dto/update-pickup-point.dto';

@Controller('pickup-points')
export class PickupPointController {
  constructor(private readonly pickupPointService: PickupPointService) {}

  @Post()
  create(@Body() createDto: CreatePickupPointDto): Promise<PickupPoint> {
    return this.pickupPointService.create(createDto);
  }

  @Get()
  findAll(): Promise<PickupPoint[]> {
    return this.pickupPointService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PickupPoint> {
    return this.pickupPointService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePickupPointDto,
  ): Promise<PickupPoint> {
    return this.pickupPointService.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.pickupPointService.remove(+id);
  }
}