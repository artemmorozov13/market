import { ProductType } from "./product-item"
import { StoreBaseType } from "./store-type"

export interface BasketBaseType {
    id: number
    productId: number
    quantity: number
    userTgchatId: number
    product: ProductType
    store: StoreBaseType
}