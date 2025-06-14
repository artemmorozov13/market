import { ProductEntity } from '@core/entities/product.entity';
import { Injectable } from '@nestjs/common';
import { ProductResponseDto } from '../dto/response-product.dto';

@Injectable()
export class ProductResponseBuilder {
  buildResponse(
    items: ProductEntity[],
    total: number,
    limit: number,
    skip: number
  ): ProductResponseDto {
    return {
      items,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total,
      },
    };
  }
}