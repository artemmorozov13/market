import { Injectable } from '@nestjs/common';
import { AuthJwtPayload } from '@core/types/user-type';
import { Roles } from '@core/enums/role-enum';
import { UsersService } from '@app/users/users.service';
import { StoreUserService } from '@app/store-user/store-user.service';
import { StoreBaseType } from '@core/types/store-type';
import { StoreUserEntity } from '@core/entities/store-user.entity';
import { UsersEntity } from '@core/entities/users.entity';

@Injectable()
export class ProductUserResolver {
  constructor(
    private readonly storeUserService: StoreUserService,
    private readonly userService: UsersService,
  ) {}

  async resolveUser(userJwt: AuthJwtPayload): Promise<StoreUserEntity | UsersEntity> {
    switch (userJwt.role) {
      case Roles.Admin:
        const admin = await this.storeUserService.getStoreUserById(userJwt.id);
        return admin

      case Roles.Vendor:
        const vendor = await this.storeUserService.getStoreUserById(userJwt.id);
        return vendor
      
      case Roles.User:
        const user = await this.userService.getUserById(userJwt.id);
        return user;
      
      default:
        return undefined;
    }
  }
}