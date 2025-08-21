import { ProductType } from '@core/types/product-item'
import { CustomerUserType } from '@entities/User/types/userTypes'

export interface BasketType {
  id: number
  productId: number
  count: number
  user: CustomerUserType
  products: ProductType[]
}
