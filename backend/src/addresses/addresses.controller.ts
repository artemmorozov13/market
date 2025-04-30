import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { User } from 'src/decorators/user.decorator';
import { AuthJwtPayload } from 'src/auth/types/auth.jwtPayload';

  
@Controller('addresses')
export class AddressesController {
    constructor(private readonly addressesService: AddressesService) {}
    
    @Post()
    @UseGuards(JwtAuthGuard)
    create(
        @User() user: AuthJwtPayload,
        @Body() createAddressDto: CreateAddressDto
    ) {
      return this.addressesService.create(user, createAddressDto);
    } 
    
    @Get()
    @UseGuards(JwtAuthGuard)
    findAll(@User() user: AuthJwtPayload) {
      return this.addressesService.findAllByUser(user);
    }
    

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    findOne(
      @User() user: AuthJwtPayload,
      @Param('id') id: string
    ) {
      return this.addressesService.findOne(user, id);
    }
  
    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    update(
      @User() user: AuthJwtPayload,
      @Param('id') id: string,
      @Body() updateAddressDto: UpdateAddressDto,
    ) {
      return this.addressesService.update(user, updateAddressDto);
    }
  
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(
      @User() user: AuthJwtPayload,
      @Param('id') id: string
    ) {
      return this.addressesService.remove(id, user);
    }
}