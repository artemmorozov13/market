import { Roles } from "../enums/role-enum"

export interface UserType {
  id: number,
  telegram_id: number,
  telegram_username: string,
  name: string,
  phone_number: string,
  is_phone_confirmed: boolean,
  email: string,
  age: number,
  created_at: Date
  updated_at: Date
  selectedProducts: {
    id: number,
    productId: number,
    quantity: number,
    userTgchatId: number
  }[]
  selectedAddressId: string
  selectedAddress: any
  addresses: any[]
}

export interface UserLoginResponse {
    user: UserType
    token: string
    refreshToken: string
}

export type AuthJwtPayload = {
    id: number
    role: Roles
    storeId?: number
}
