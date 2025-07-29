import { setSeederFactory } from "typeorm-extension";
import * as bcrypt from "bcryptjs";
import { StoreUserEntity } from "../entities/store-user.entity";
import { Roles } from "../enums/role-enum";
import { customFaker } from "./main.factory";


export const StoreUserFactory = setSeederFactory(StoreUserEntity, async () => {
    const storeUser = new StoreUserEntity();

    
    
    const firstName = customFaker.person.firstName();
    const lastName = customFaker.person.lastName();
    
    storeUser.email = customFaker.internet.email({ firstName, lastName });
    storeUser.password = await bcrypt.hash('123456', 10);
    storeUser.role = Roles.Admin;
    
    return storeUser;
});