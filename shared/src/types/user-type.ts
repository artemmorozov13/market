import { Roles } from "../enums/role-enum"
import { AddressType } from "./address-type"
import { BasketBaseType } from "./basket-tipe"

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
  selectedProducts: BasketBaseType[]
  selectedAddressId: string
  selectedAddress: AddressType
  addresses: AddressType[]
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
