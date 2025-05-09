import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from './dto/pagination.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/types/role-enum';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';

@Controller('product')
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    getProductsList(@Query() options: PaginationDto) {
        return this.productService.getProductsList(options);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    getProductById(@Param('id') id: number) {
        return this.productService.getProductById(id);
    }

    @Post()
    @AllowRoles(Roles.Admin)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    createProduct(@Body() product: CreateProductDto) {
        return this.productService.createProduct(product);
    }

    @Post('revover/:id')
    @AllowRoles(Roles.Admin)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    rocoverProduct(@Param('id') id: number) {
        return this.productService.rocoverProduct(id);
    }

    @Patch(':id')
    @AllowRoles(Roles.Admin)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    updateProduct(@Param('id') id: number, @Body() product: UpdateProductDto) {
        return this.productService.updateProduct(id, product);
    }

    @Delete(':id')
    @AllowRoles(Roles.Admin)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    deleteProduct(@Param('id') id: number) {
        return this.productService.deleteProduct(id);
    }
}