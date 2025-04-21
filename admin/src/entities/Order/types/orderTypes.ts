import { ProductType } from "@entities/Product";
import { StoreOwnerUserType } from "@entities/User/types/userTypes";


interface OrderedProductType {
  id: number
  telegram_id: number
  quantity: number
  product: ProductType
}

export interface OrderType {
  id: number;
  status: StatusEnum.Finished | StatusEnum.WaitForPay;
  created_at: Date;
  updated_at: Date;
  address: string;
  fullAddress: string;
  phoneNumber?: string;
  comment?: string;
  deliveryDate: string
  user: StoreOwnerUserType;
  ordered_products: OrderedProductType[];
  pickupPoint?: {
    id: number;
    name: string;
    address?: string;
  };
  deliveryTime?: {
    id: number;
    startTime: string;
    endTime: string;
  };
}

export enum StatusEnum {
  WaitForPay = 'waitForPay',
  Finished = 'finished'
}

