import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { UserRoleDto } from './dto/userRole.dto';

@Controller('roles')
export class RolesController {
    @Get()
    getUserRoles() {
        return 'all roles in app'
    }

    @Get(":id")
    getUserRolesById(@Param("id", ParseIntPipe) id: number) {
        return `role by id, where role is ${id}`
    }

    @Post()
    createUserRole(@Body() body: UserRoleDto) {
        return body
    }

    @Patch(":id")
    updateUserRoleById(
        @Param("id") id: number,
        @Body() body: UserRoleDto
    ) {
        return `updated by id ${id} with body ${body}`
    }

    @Delete(":id")
    deleteUserRoleById(@Param("id", ParseIntPipe) id: number) {
        return `Delete role with id ${id}`
    }
}
