import { Controller, Get, Param, Post, Delete, Body, Headers } from '@nestjs/common';
import { BasketService } from './basket.service';
import { AddProductToBasketDto } from './dto/add-product-to-basket.dto';
import { RemoveProductFromBasketDto } from './dto/remove-product-to-basket.dto';

@Controller('basket')
export class BasketController {
  constructor(private readonly basketService: BasketService) {}

  @Get()
  getBasket(@Headers('init-data') initData: string) {
    return this.basketService.getBasketById(initData);
  }

  @Post('clear')
  clearBasket(@Headers('init-data') initData: string,) {
    return this.basketService.clearBasket(initData)
  }

  @Post('add-product')
  addProductToBasket(
    @Body() addProductToBasketDto: AddProductToBasketDto,
    @Headers('init-data') initData: string,
  ) {
    return this.basketService.addProductToBasket(initData, addProductToBasketDto.productId);
  }

  @Post('remove-product')
  removeProductFromBasket(
    @Body() removeProductFromBasketDto: RemoveProductFromBasketDto,
    @Headers('init-data') initData: string,
  ) {
    return this.basketService.removeProductFromBasket(initData, removeProductFromBasketDto.productId);
  }
}