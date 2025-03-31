import { Body, Controller, Get, Header, Headers, Post, Query, UnauthorizedException, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrderQueryDto } from './dto/get-order-query.dto';
import { TelegramUtils } from 'src/utils/telegram.utils';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  getOrdersData(@Query() query: GetOrderQueryDto) {
    return this.orderService.getOrdersListData(query)
  }

  @Post('create')
  createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Headers('init-data') initData: string,
  ) {
    return this.orderService.createOrder(createOrderDto, initData)
  }

  @Post('update-status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Body() updateStatusDto: UpdateOrderStatusDto
  ) {
    return this.orderService.updateOrderStatus(updateStatusDto)
  }
}
