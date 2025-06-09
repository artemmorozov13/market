import { Roles } from "@core/enums/role-enum";
import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = 'roles';

export const AllowRoles = (...roles: [Roles, ...Roles[]]) => {
    return SetMetadata(ROLES_KEY, roles)
}