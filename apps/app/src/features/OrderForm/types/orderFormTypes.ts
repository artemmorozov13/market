import { DeliveryStrategyEnum } from "@core/enums/delivery-strategy.enum";
import { AddressType } from "@core/types/address-type";

interface OrderFormBaseInputs {
    phone: string;
    comment: string;
    deliveryMethod: 'delivery' | 'pickup' | null;
    storeId: number;
    deliveryStrategy: DeliveryStrategyEnum | null;
}

interface DeliveryFormInputs extends OrderFormBaseInputs {
    deliveryMethod: 'delivery' | null;
    deliveryAreaId: number | null;
    deliveryTimeId: string | null;
    deliveryDate: string | null;
    addressId: string | null;
    address: AddressType | null;
    pickupPointId?: number | null
}

interface PickupFormInputs extends OrderFormBaseInputs {
    deliveryMethod: 'pickup'| null;
    pickupPointId: number | null;
    deliveryAreaId?: number | null;
    deliveryTimeId?: number | null;
    deliveryDate?: string | null;
    addressId?: string | null;
    address?: AddressType| null;
}

export type OrderFormInputs = DeliveryFormInputs | PickupFormInputs;
