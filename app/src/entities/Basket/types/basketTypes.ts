import { ProductType } from "@/entities/Product"

export interface BasketType {
    id: number
    productId: number
    quantity: number
    userTgchatId: number
    product: ProductType
}
