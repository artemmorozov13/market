import { Injectable } from '@nestjs/common';
import { AuthJwtPayload } from '@core/types/user-type';
import { Roles } from '@core/enums/role-enum';
import { UsersService } from '@app/users/users.service';
import { StoreUserService } from '@app/store-user/store-user.service';
import { StoreBaseType } from '@core/types/store-type';
import { StoreEntity } from '@core/entities/store.entity';

@Injectable()
export class PickupPointStoreResolver {
  constructor(
    private readonly storeUserService: StoreUserService,
    private readonly userService: UsersService,
  ) {}

  async resolveStore(userJwt: AuthJwtPayload): Promise<StoreEntity | undefined> {
    switch (userJwt.role) {
      case Roles.Admin:
        const admin = await this.storeUserService.getStoreUserById(userJwt.id);
        return admin?.store;
      
      case Roles.User:
        const user = await this.userService.getUserById(userJwt.id);
        return user?.store;
      
      default:
        return undefined;
    }
  }
}