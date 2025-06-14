import { ProductEntity } from '@core/entities/product.entity';
import { Injectable } from '@nestjs/common';
import { FindOptionsWhere } from 'typeorm';

@Injectable()
export class ProductQueryBuilder {
  buildWhereConditions(
    is_expired: boolean | undefined,
    storeId: number | undefined
  ): FindOptionsWhere<ProductEntity> {
    const where: FindOptionsWhere<ProductEntity> = {};

    if (typeof is_expired === 'boolean') {
      where.is_expired = !is_expired;
    }

    if (storeId) {
      where.store = { id: storeId };
    }

    return where;
  }

  getSortingOrder(): { [P in keyof ProductEntity]?: 'ASC' | 'DESC' } {
    return {
      is_expired: 'ASC',
      updatedAt: 'DESC',
    };
  }
}