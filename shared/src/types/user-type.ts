import { Roles } from "../enums/role-enum"
import { AddressType } from "./address-type"
import { BasketBaseType } from "./basket-tipe"

export interface UserType {
  id: number,
  telegram_id: number | null,
  telegram_username: string | null,
  name: string | null,
  phone_number: string | null,
  is_phone_confirmed: boolean,
  email: string | null,
  age: number | null,
  created_at: Date | null
  updated_at: Date | null
  selectedProducts: BasketBaseType[]
  selectedAddressId: string | null
  selectedAddress: AddressType | null
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
