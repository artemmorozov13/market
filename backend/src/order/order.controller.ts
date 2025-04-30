import { Body, Controller, Get, Headers, InternalServerErrorException, Post, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
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
  @UseGuards(JwtAuthGuard)
  getCurrentOrders(
    @User() user: AuthJwtPayload,
  ) {
    return this.orderService.getCurrentUserOrders(user);
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

  @Post('export-inner-table')
  @UseGuards(JwtAuthGuard)
  async exportExcelWithInnerTable(@Res() res: Response) {
    try {
      const buffer = await this.orderService.exportExcelWithInnerTable();
      
      const now = new Date();
      const safeDate = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
      const fileName = `заказы_ожидающие_оплаты_${safeDate}.xlsx`;
      
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(fileName)}"`
      );
      
      res.end(Buffer.from(buffer));
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ message: 'Failed to generate Excel file' });
    }
  }

  @Post('export-wide-table')
  @UseGuards(JwtAuthGuard)
  async exportExcelFullWidthTable(@Res() res: Response) {
    try {
      const buffer = await this.orderService.exportToWideFormatExcel();
      
      const now = new Date();
      const safeDate = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
      const fileName = `заказы_ожидающие_оплаты_${safeDate}.xlsx`;
      
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(fileName)}"`
      );
      
      res.end(Buffer.from(buffer));
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ message: 'Failed to generate Excel file' });
    }
  }
}
