export type UserRoleType = 'customer' | 'notAuthed';

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
}

export interface AuthViaTelegramResponse {
  user: UserType
  token: string
}
