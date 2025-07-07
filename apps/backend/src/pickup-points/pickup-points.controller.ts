import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { CreatePickupPointDto } from './dto/create-pickup-point.dto';
import { UpdatePickupPointDto } from './dto/update-pickup-point.dto';
import { PickupPointService } from './pickup-points.service';
import { PickupPointEntity } from '@core/entities/pickup-point.entity';
import { PickupWorkingHoursEntity } from '@core/entities/pickup-working-hours.entity';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '@app/auth/guards/roles/roles.guard';
import { AllowRoles } from '@app/auth/decorators/roles.decorator';
import { Roles } from '@core/enums/role-enum';
import { User } from '@app/decorators/user.decorator';
import { AuthJwtPayload } from '@core/types/user-type';

@Controller('pickup-points')
export class PickupPointsController {
  constructor(private readonly pickupPointService: PickupPointService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@User() user: AuthJwtPayload): Promise<PickupPointEntity[]> {
    return this.pickupPointService.findAll(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<PickupPointEntity> {
    return this.pickupPointService.findOne(id);
  }

  @AllowRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @User() user: AuthJwtPayload,
    @Body() createPickupPointDto: CreatePickupPointDto,
  ): Promise<PickupPointEntity> {
    return this.pickupPointService.create(user, createPickupPointDto);
  }

  @AllowRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @User() user: AuthJwtPayload,
    @Param('id') id: number,
    @Body() updatePickupPointDto: UpdatePickupPointDto,
  ): Promise<PickupPointEntity> {
    return this.pickupPointService.update(user, id, updatePickupPointDto);
  }

  @AllowRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.pickupPointService.remove(id);
  }

//   @Get(':id/working-hours')
//   async getWorkingHours(
//     @Param('id') pickupPointId: number,
//   ): Promise<PickupWorkingHoursEntity[]> {
//     return this.pickupPointService.getWorkingHours(pickupPointId);
//   }
}