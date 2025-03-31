import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from './dto/pagination.dto';

@Controller('product')
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @Get()
    getProductsList(@Query() options: PaginationDto) {
        return this.productService.getProductsList(options);
    }

    @Get(':id')
    getProductById(@Param('id') id: number) {
        return this.productService.getProductById(id);
    }

    @Post()
    createProduct(@Body() product: CreateProductDto) {
        return this.productService.createProduct(product);
    }

    @Patch(':id')
    updateProduct(@Param('id') id: number, @Body() product: UpdateProductDto) {
        return this.productService.updateProduct(id, product);
    }

    @Delete(':id')
    deleteProduct(@Param('id') id: number) {
        return this.productService.deleteProduct(id);
    }
}