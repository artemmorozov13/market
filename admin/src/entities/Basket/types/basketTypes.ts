import { CustomerUserType, UserType } from "@entities/User/types/userTypes"
import { ProductType } from "../../Product/types/productTypes"

export interface BasketType {
    id: number
    productId: number
    count: number
    user: CustomerUserType
    products: ProductType[]
}