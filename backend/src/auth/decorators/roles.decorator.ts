import { SetMetadata } from "@nestjs/common";
import { Roles } from "../types/role-enum";

export const ROLES_KEY = 'roles';

export const AllowRoles = (...roles: [Roles, ...Roles[]]) => {
    return SetMetadata(ROLES_KEY, roles)
}