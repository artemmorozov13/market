import { PartialType } from '@nestjs/mapped-types';
import { CreateOfferedProductDto } from './create-offered-product.dto';

export class UpdateOfferedProductDto extends PartialType(CreateOfferedProductDto) {
  isAccepted?: boolean;
  isCanceled?: boolean;
}