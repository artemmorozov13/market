import { Controller, Get, Param, Post, Delete, Body, Headers, UseGuards } from '@nestjs/common';
import { BasketService } from './basket.service';
import { AddProductToBasketDto } from './dto/add-product-to-basket.dto';
import { RemoveProductFromBasketDto } from './dto/remove-product-to-basket.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { User } from 'src/decorators/user.decorator';
import { AuthJwtPayload } from '@core/types/user-type';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { Roles } from '@core/enums/role-enum';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';

@Controller('basket')
export class BasketController {
  constructor(private readonly basketService: BasketService) {}

  @Get()
  @AllowRoles(Roles.User)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  getBasket(@User() user: AuthJwtPayload) {
    return this.basketService.getBasketById(user);
  }

  @Post('clear')
  @AllowRoles(Roles.User)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  clearBasket(@User() user: AuthJwtPayload) {
    return this.basketService.clearBasket(user)
  }

  @Post('add-product')
  @AllowRoles(Roles.User)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  addProductToBasket(
    @Body() addProductToBasketDto: AddProductToBasketDto,
    @User() user: AuthJwtPayload
  ) {
    return this.basketService.addProductToBasket(user, addProductToBasketDto.productId);
  }

  @Post('remove-product')
  @AllowRoles(Roles.User)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  removeProductFromBasket(
    @Body() removeProductFromBasketDto: RemoveProductFromBasketDto,
    @User() user: AuthJwtPayload
  ) {
    return this.basketService.removeProductFromBasket(user, removeProductFromBasketDto.productId);
  }

  @Post('reset-product')
  @AllowRoles(Roles.User)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  resetBasketProduct(
    @Body() removeProductFromBasketDto: RemoveProductFromBasketDto,
    @User() user: AuthJwtPayload
  ) {
    return this.basketService.resetBasketProduct(user, removeProductFromBasketDto.productId);
  }
}