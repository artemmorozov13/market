import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from './dto/pagination.dto';
import { ProductResponseDto } from './dto/response-product.dto';
import { ProductEntity } from '@core/entities/product.entity';
import { AuthJwtPayload } from '@core/types/user-type';
import { ProductStoreResolver } from './lib/product-store-resolver';
import { ProductQueryBuilder } from './lib/product-query-builder';
import { ProductResponseBuilder } from './lib/product-response-builder';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
        private readonly storeResolver: ProductStoreResolver,
        private readonly queryBuilder: ProductQueryBuilder,
        private readonly responseBuilder: ProductResponseBuilder,
    ) {}

    async getProductsList(userJwt: AuthJwtPayload, options: PaginationDto): Promise<ProductResponseDto> {
        const { limit = 10, skip = 0, is_expired } = options;

        const store = await this.storeResolver.resolveStore(userJwt);
        
        const where = this.queryBuilder.buildWhereConditions(is_expired, store.id);

        const [items, total] = await this.productRepository.findAndCount({
            where,
            skip,
            take: limit,
            order: this.queryBuilder.getSortingOrder(),
            relations: ['store'],
        });

        return this.responseBuilder.buildResponse(items, total, limit, skip);
    }

    async getProductById(id: number): Promise<ProductEntity> {
        const product = await this.productRepository.findOneBy({ id });
        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
    }

    async createProduct(userJwt: AuthJwtPayload, createProductDto: CreateProductDto): Promise<ProductEntity> {
        const store = await this.storeResolver.resolveStore(userJwt)
        const product = this.productRepository.create({
          ...createProductDto,
          is_expired: false,
          store
        });
        return this.productRepository.save(product);
    }

    async updateProduct(id: number, updateProductDto: UpdateProductDto): Promise<ProductEntity> {
        const product = await this.getProductById(id);
        Object.assign(product, updateProductDto); 
        return this.productRepository.save(product);
    }

    async deleteProduct(id: number): Promise<void> {
      this.productRepository.update(id, { is_expired: true })
    }

    async rocoverProduct(id: number): Promise<void> {
      this.productRepository.update(id, { is_expired: false })
    }
}