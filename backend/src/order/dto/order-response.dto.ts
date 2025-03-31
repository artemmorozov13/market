import { ProductResponseDto } from "src/product/dto/response-product.dto";

export class OrderResponseDto {
  id: number;
  status: 'waitForPay' | 'payConfirm' | 'finished';
  created_at: Date;
  updated_at: Date;
  userId: number;
  products: ProductResponseDto[];
}