import { Roles } from "./role-enum"

export type AuthJwtPayload = {
    sub: number
    role: Roles
}