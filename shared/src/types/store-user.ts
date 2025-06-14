import { Roles } from "../enums/role-enum"
import { StoreBaseType } from "./store-type"

export interface StoreUserBaseType {
    id: number,
    email: string,
    password: string,
    role: Roles,
    createdAt: Date,
    updatedAt: Date,
    store: StoreBaseType
}
