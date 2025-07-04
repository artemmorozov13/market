import { ProductResponseDto } from "src/product/dto/response-product.dto";

export class BasketResponseDto {
  id: number;
  products_count: number;
  userId: number;
  products: ProductResponseDto[];
}