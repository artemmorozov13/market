import { DeliveryTime } from "@core/entities/delivery-time.entity"

export const filterActiveTime = (interval: DeliveryTime) => {
    return interval.isActive;
}