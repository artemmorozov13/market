import { setSeederFactory } from "typeorm-extension";
import { PickupPointEntity } from "../entities/pickup-point.entity";
import { customFaker } from "./main.factory";


export const PickupPointFactory = setSeederFactory(PickupPointEntity, () => {
    const pickupPoint = new PickupPointEntity();

    
    
    pickupPoint.name = `Пункт выдачи ${customFaker.location.street()}`;
    pickupPoint.fullAddress = customFaker.location.streetAddress();
    pickupPoint.postal_code = customFaker.location.zipCode();
    pickupPoint.fias_id = customFaker.string.uuid();
    pickupPoint.geo_lat = customFaker.location.latitude().toString();
    pickupPoint.geo_lon = customFaker.location.longitude().toString();
    pickupPoint.status = 'active';
    
    return pickupPoint;
});