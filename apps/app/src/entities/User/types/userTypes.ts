import { UserType } from "@core/types/user-type"

export interface AuthViaTelegramResponse {
  user: UserType
  token: string
  refreshToken: string
}
