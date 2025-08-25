import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from './dto/pagination.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from '@core/enums/role-enum';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { User } from '@app/decorators/user.decorator';
import { AuthJwtPayload } from '@core/types/user-type';

@Controller('product')
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @Get()
    @AllowRoles(Roles.Admin, Roles.SuperAdmin, Roles.User)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    getProductsList(@User() user: AuthJwtPayload, @Query() options: PaginationDto) {
        return this.productService.getProductsList(user, options);
    }

    @Get('store/:id')
    getProductsListByStoreId(
        @Param('id') storeId: number,
        @Query('page') page = 1,
        @Query('limit') limit = 10
    ) {
        return this.productService.getProductsListByStoreId(storeId, page, limit);
    }


    @Get('offered')
    @AllowRoles(Roles.Admin, Roles.SuperAdmin, Roles.User, Roles.Vendor)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    getOfferedProductsList(@User() user: AuthJwtPayload, @Query() options: PaginationDto) {
        return this.productService.getOfferedProductsList(user, options);
    }

    @Get(':id')
    getProductById(@Param('id') id: number) {
        return this.productService.getProductById(id);
    }

    @Post()
    @AllowRoles(Roles.Admin)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    createProduct(@User() user: AuthJwtPayload, @Body() product: CreateProductDto) {
        return this.productService.createProduct(user, product);
    }

    @Post('revover/:id')
    @AllowRoles(Roles.Admin)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    rocoverProduct(
        @User() user: AuthJwtPayload,
        @Param('id') id: number
    ) {
        return this.productService.setStatusAccept(user, id);
    }

    @Patch(':id')
    @AllowRoles(Roles.Admin)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    updateProduct(@User() user: AuthJwtPayload, @Param('id') id: number, @Body() product: UpdateProductDto) {
        return this.productService.updateProduct(user, id, product);
    }

    @Delete(':id')
    @AllowRoles(Roles.Admin)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    deleteProduct(
        @User() user: AuthJwtPayload,
        @Param('id') id: number
    ) {
        return this.productService.deleteProduct(user, id);
    }
}