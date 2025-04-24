import { Body, Controller, Get, Headers, Post, Query, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrderQueryDto } from './dto/get-order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { User } from 'src/decorators/user.decorator';
import { AuthJwtPayload } from 'src/auth/types/auth.jwtPayload';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getOrdersData(@Query() query: GetOrderQueryDto) {
    return this.orderService.getOrdersListData(query)
  }

  @Get('current')
  getCurrentOrders(
    @Headers('init-data') initData: string,
  ) {
    return this.orderService.getCurrentUserOrders(initData);
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @User() user: AuthJwtPayload,
  ) {
    return this.orderService.createOrder(createOrderDto, user)
  }

  @Post('update-order')
  updateOrder(
    @Body() updateOrderDto: UpdateOrderDto,
    @Headers('init-data') initData: string,
  ) {
    return this.orderService.updateOrder(updateOrderDto.id, updateOrderDto, initData)
  }

  @Post('update-status')
  // @UseGuards(JwtAuthGuard)
  updateStatus(@Body() updateStatusDto: UpdateOrderStatusDto) {
    return this.orderService.updateOrderStatus(updateStatusDto)
  }
}
