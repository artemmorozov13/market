import { setSeederFactory } from "typeorm-extension";
import { DeliveryArea } from "../entities/delivery-area.entity";

import { customFaker } from "./main.factory";

export const DeliveryAreaFactory = setSeederFactory(DeliveryArea, () => {
    const deliveryArea = new DeliveryArea();

    
    deliveryArea.name = `Зона доставки ${customFaker.location.street()}`;
    deliveryArea.radius = customFaker.number.int({ min: 1000, max: 10000 });
    deliveryArea.fullAddress = customFaker.location.streetAddress();
    deliveryArea.postal_code = customFaker.location.zipCode();
    deliveryArea.fias_id = customFaker.string.uuid();
    deliveryArea.geo_lat = customFaker.location.latitude().toString();
    deliveryArea.geo_lon = customFaker.location.longitude().toString();
    deliveryArea.status = 'active';
    
    return deliveryArea;
});