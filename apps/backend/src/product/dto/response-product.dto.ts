import { ProductEntity } from "@core/entities/product.entity"

export class ProductResponseDto {
    items: ProductEntity[]
    pagination: {
      total: number,
      limit: number,
      skip: number,
      hasMore: boolean,
    }
}