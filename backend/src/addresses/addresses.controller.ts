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

  
@Controller('addresses')
export class AddressesController {
    constructor(private readonly addressesService: AddressesService) {}
    
    @UseGuards(JwtAuthGuard)
    @Post()
    create(
        @User() user: any,
        @Body() createAddressDto: CreateAddressDto
    ) {
      return this.addressesService.create(user, createAddressDto);
    } 
    
    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(@User() user: any,) {
      return this.addressesService.findAllByUser(user);
    }
    

    @Get(':id')
    findOne(@Req() req, @Param('id') id: string) {
      return this.addressesService.findOne(id, req.user.id);
    }
  
    @Patch(':id')
    update(
      @Req() req,
      @Param('id') id: string,
      @Body() updateAddressDto: UpdateAddressDto,
    ) {
      return this.addressesService.update(id, req.user.id, updateAddressDto);
    }
  
    @Delete(':id')
    remove(@Req() req, @Param('id') id: string) {
      return this.addressesService.remove(id, req.user.id);
    }
}