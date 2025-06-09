import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PaginationDto } from './dto/pagination.dto';
import { ProductResponseDto } from './dto/response-product.dto';
import { ProductEntity } from '@core/entities/product.entity';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
    ) {}

    async getProductsList({ limit = 10, skip = 0, is_expired }: PaginationDto): Promise<ProductResponseDto> {
      const whereConditions: FindOptionsWhere<ProductEntity> | FindOptionsWhere<ProductEntity>[] = {};
      
      if (typeof is_expired === "boolean") {
          whereConditions.is_expired = !is_expired;
      }
    
      const [items, total] = await this.productRepository.findAndCount({
          skip: skip,
          take: limit,
          order: { 
              is_expired: "ASC",
              createdAt: "DESC"
          },
          where: whereConditions
      });
    
      return {
          items: items,
          pagination: {
              total,
              limit,
              skip,
              hasMore: skip + limit < total,
          },
      };
  }

    async getProductById(id: number): Promise<ProductEntity> {
        const product = await this.productRepository.findOneBy({ id });
        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
    }

    async createProduct(createProductDto: CreateProductDto): Promise<ProductEntity> {
        const product = this.productRepository.create({
          ...createProductDto,
          is_expired: false
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