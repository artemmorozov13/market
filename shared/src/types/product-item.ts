import { ProductStatusEnum } from "../enums/product-status-enum";
import { UnitOfMeasuresEnum } from "../enums/units-of-measures";
import { StoreBaseType } from "./store-type";

export interface ProductType {
  id: number;
  name: string;
  description: string;
  price: number;
  offeredPrice: number
  discount: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
  unitValue: number;
  unitOfMeasurement: UnitOfMeasuresEnum;
  canelComment: string;
  status: ProductStatusEnum;
  store?: StoreBaseType;
}