import { UsersEntity } from "../entities/users.entity";
import { setSeederFactory } from "typeorm-extension";
import { faker } from "@faker-js/faker";

export const UserFactory = setSeederFactory(UsersEntity, () => {
    const user = new UsersEntity();

    user.name = faker.person.firstName();
    user.email = faker.internet.email();
    user.age = faker.helpers.rangeToNumber({ min: 18, max: 60 });
    user.telegram_id = faker.number.int({ min: 1000000000, max: 2147483647 });

    return user;
});