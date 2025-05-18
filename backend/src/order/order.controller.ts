import { Body, Controller, Get, Headers, InternalServerErrorException, ParseArrayPipe, Post, Query, Res, UseGuards } from '@nestjs/common';
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
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { Roles } from 'src/auth/types/role-enum';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @AllowRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  getOrdersData(@Query() query: GetOrderQueryDto) {
    return this.orderService.getOrdersListData(query)
  }

  @Get('current')
  @AllowRoles(Roles.User, Roles.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  getCurrentOrders(
    @User() user: AuthJwtPayload,
  ) {
    return this.orderService.getCurrentUserOrders(user);
  }

  @Post('create')
  @AllowRoles(Roles.User)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @User() user: AuthJwtPayload,
  ) {
    return this.orderService.createOrder(createOrderDto, user)
  }

  @Post('update-order')
  @AllowRoles(Roles.User)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  updateOrder(
    @Body() updateOrderDto: UpdateOrderDto,
    @User() user: AuthJwtPayload,
  ) {
    return this.orderService.updateOrder(updateOrderDto, user)
  }

  @Post('update-status')
  @AllowRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  updateStatus(@Body() updateStatusDto: UpdateOrderStatusDto) {
    return this.orderService.updateOrderStatus(updateStatusDto)
  }

  @Post('export-inner-table')
  @AllowRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  async exportExcelWithInnerTable(
    @Res() res: Response,
    @Query('pickupPointIds', new ParseArrayPipe({ 
      items: Number, 
      separator: ',', 
      optional: true 
    })) pickupPointIds?: number[]
  ) {
    try {
      const buffer = await this.orderService.exportExcelWithInnerTable(pickupPointIds);
      
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
  @AllowRoles(Roles.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  async exportExcelFullWidthTable(
    @Res() res: Response,
    @Query('pickupPointIds', new ParseArrayPipe({ 
      items: Number, 
      separator: ',', 
      optional: true 
    })) pickupPointIds?: number[]
  ) {
    try {
      const buffer = await this.orderService.exportToWideFormatExcel(pickupPointIds);
      
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
