import { DeliveryStrategyEnum } from "@core/enums/delivery-strategy.enum";
import { AddressType } from "@core/types/address-type";

interface OrderFormBaseInputs {
    phone: string;
    comment: string;
    deliveryMethod: DeliveryStrategyEnum.DeliveryToEntrance | DeliveryStrategyEnum.PickupByYourself | null;
    storeId: number;
    deliveryStrategy: DeliveryStrategyEnum | null;
}

interface DeliveryFormInputs extends OrderFormBaseInputs {
    deliveryMethod: DeliveryStrategyEnum.DeliveryToEntrance | null;
    deliveryAreaId: number | null;
    deliveryTimeId: string | null;
    deliveryDate: string | null;
    addressId: string | null;
    address: AddressType | null;
    pickupPointId?: number | null
}

interface PickupFormInputs extends OrderFormBaseInputs {
    deliveryMethod: DeliveryStrategyEnum.PickupByYourself| null;
    pickupPointId: number | null;
    deliveryAreaId?: number | null;
    deliveryTimeId?: number | null;
    deliveryDate?: string | null;
    addressId?: string | null;
    address?: AddressType| null;
}

export type OrderFormInputs = DeliveryFormInputs | PickupFormInputs;
