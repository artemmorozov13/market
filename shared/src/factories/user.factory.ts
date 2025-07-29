import * as bcrypt from "bcryptjs";
import { setSeederFactory } from "typeorm-extension";
import { UsersEntity } from "../entities/users.entity";
import { Roles } from "../enums/role-enum";
import { customFaker } from "./main.factory";

export const UserFactory = setSeederFactory(UsersEntity, async () => {
    const user = new UsersEntity();
    
    const firstName = customFaker.person.firstName();
    const lastName = customFaker.person.lastName();
    
    user.name = customFaker.datatype.boolean(0.8) ? `${firstName} ${lastName}` : null;
    user.telegram_id = customFaker.datatype.boolean(0.3) ? Number(customFaker.number.int({ min: 100000000, max: 999999999 })) : undefined;
    user.telegram_username = customFaker.datatype.boolean(0.4) ? customFaker.internet.userName() : null;
    user.phone_number = customFaker.datatype.boolean(0.7) ? customFaker.phone.number() : null;
    user.is_phone_confirmed = customFaker.datatype.boolean();
    user.email = customFaker.datatype.boolean(0.6) ? customFaker.internet.email({ firstName, lastName }) : null;
    user.age = customFaker.datatype.boolean(0.5) ? customFaker.number.int({ min: 12, max: 90 }) : null;
    user.password = customFaker.datatype.boolean(0.7) ? await bcrypt.hash(customFaker.internet.password(), 10) : null;
    
    user.role = Roles.User;
    
    const now = new Date();
    const twoYearsAgo = new Date(now);
    twoYearsAgo.setFullYear(now.getFullYear() - 2);
    
    user.created_at = customFaker.date.between({ from: twoYearsAgo, to: now });
    user.updated_at = customFaker.date.between({ from: user.created_at, to: now });
    
    return user;
});