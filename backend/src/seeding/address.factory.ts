import { faker } from "@faker-js/faker";
import { AddressEntity } from "../entities/address.entity";
import { setSeederFactory } from "typeorm-extension";

export const AddressFactory = setSeederFactory(AddressEntity, () => {
    const address = new AddressEntity();
    address.addressString = faker.location.secondaryAddress();
    return address;
});
