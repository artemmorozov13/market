import { BadRequestException, Injectable } from '@nestjs/common';
import { FindManyOptions } from 'typeorm';
import { CreateOfferedProductDto } from './dto/create-offered-product.dto';
import { UpdateOfferedProductDto } from './dto/update-offered-product.dto';
import { StoreUserService } from '@app/store-user/store-user.service';
import { AuthJwtPayload } from '@core/types/user-type';
import { ProductEntity } from '@core/entities/product.entity';
import { ProductService } from '@app/product/product.service';
import { PaginationDto } from '@app/product/dto/pagination.dto';
import { ProductResponseDto } from '@app/product/dto/response-product.dto';

@Injectable()
export class OfferedProductsService {
    constructor(
        private readonly productService: ProductService,
    ) {}

    async create(userJwt: AuthJwtPayload, createDto: CreateOfferedProductDto): Promise<ProductEntity> {
        return this.productService.createProduct(
            userJwt,
            createDto
        );
    }

    async findAll(userJwt: AuthJwtPayload, options?: PaginationDto): Promise<ProductResponseDto> {
        return await this.productService.getOfferedProductsList(userJwt, options);
    }

    async findOne(id: number): Promise<ProductEntity> {
        return this.productService.getProductById(id);
    }

    async update(id: number, updateDto: UpdateOfferedProductDto, userJwt: AuthJwtPayload): Promise<ProductEntity> {
        return this.productService.updateProduct(userJwt, id, updateDto)
    }

    async remove(id: number, userJwt: AuthJwtPayload): Promise<void> {
        return this.productService.deleteProduct(userJwt, id)
    }

    async acceptProduct(id: number, userJwt: AuthJwtPayload): Promise<void> {
        return this.productService.setStatusAccept(userJwt, id)
    }


    async cancelProduct(id: number, userJwt: AuthJwtPayload, canelComment: string): Promise<void> {
        return await this.productService.setStatusRejected(userJwt, id, canelComment)
    }

    async hiddenProduct(id: number, userJwt: AuthJwtPayload): Promise<void> {
        return await this.productService.setStatusHidden(userJwt, id)
    }
}