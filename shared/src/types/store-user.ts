import { Roles } from "../enums/role-enum"
import { ProductType } from "./product-item"
import { StoreBaseType } from "./store-type"

export interface StoreUserBaseType {
    id: number,
    email: string,
    password: string,
    role: Roles,
    createdAt: Date,
    updatedAt: Date,
    store?: StoreBaseType
    products?: ProductType[]
}
