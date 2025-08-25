import { BasketType } from '@entities/Basket'
import { OrderType } from '@entities/Order'

// export type UserType = StoreOwnerUserType | CustomerUserType

export interface StoreOwnerUserType {
  id: number
  telegram_id: number
  name: string
  email: string
  age: number
  telegram_username: string
  created_at: Date
  updated_at: Date
}

export interface UserLoginResponse {
  user: StoreOwnerUserType
  token: string
  refreshToken: string
}

export interface CustomerUserType {
  id: number
  name: string
  email: string
  age: number
  created_at: Date
  updated_at: Date
  basket: BasketType
  orders: OrderType[]
}
