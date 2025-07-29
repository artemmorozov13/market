import { setSeederFactory } from "typeorm-extension";
import { AddressesEntity } from "../entities/addresses.entity";
import { customFaker } from "./main.factory";

export const AddressFactory = setSeederFactory(AddressesEntity, () => {
    const address = new AddressesEntity();
    
    address.fullAddress = customFaker.location.streetAddress();
    address.entrance = customFaker.number.int({ min: 1, max: 10 }).toString();
    address.floor = customFaker.number.int({ min: 1, max: 20 }).toString();
    address.apartment = customFaker.number.int({ min: 1, max: 200 }).toString();
    address.intercom = customFaker.number.int({ min: 1000, max: 9999 }).toString();        
    address.postal_code = customFaker.location.zipCode('######');
    address.fias_id = customFaker.string.uuid();
    address.geo_lat = customFaker.location.latitude().toString();
    address.geo_lon = customFaker.location.longitude().toString();
    
    return address;
});