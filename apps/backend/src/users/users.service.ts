import { BadRequestException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BasketService } from 'src/basket/basket.service';
import { Repository } from 'typeorm';
import { GetQueryParamsDto } from './dto/get-query-params.dto';
import { TelegramUtils } from 'src/utils/telegram.utils';
import { AuthService } from 'src/auth/auth.service';
import { UsersEntity } from '@core/entities/users.entity';
import { OrderEntity } from '@core/entities/order.entity';
import { StoreService } from '@app/store/store.service';
import { AuthJwtPayload } from '@core/types/user-type';
import { UpdateUserDto } from './dto/update-user-dto';
import { JwtService } from '@nestjs/jwt';
import { AddressesEntity } from '@core/entities';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    private readonly basketService: BasketService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly storeService: StoreService,
    private readonly telegramUtils: TelegramUtils,
    private jwtService: JwtService
  ) {}

  async getUserById(userId: number) {
    return await this.usersRepository.findOne({
      where: {
        id: userId
      },
      select: [
        'id',
        'email',
        'name',
        'age',
        'is_phone_confirmed',
        'phone_number',
        'role',
        'telegram_id',
        'telegram_username'
      ],
      relations: ['selectedProducts', 'selectedAddress', 'store', 'addresses']
    })
  }

  async getUserByTelegramId(telegramId: number) {
    return await this.usersRepository.findOne({
      where: {
        telegram_id: telegramId
      },
      select: [
        'id',
        'email',
        'name',
        'age',
        'is_phone_confirmed',
        'phone_number',
        'role',
        'telegram_id',
        'telegram_username'
      ]
    })
  }

  async getUsersDataList({ limit = 10, skip }: GetQueryParamsDto) {
    return await this.usersRepository.find({
        skip: skip,
        take: limit
    })
  }

  async createUser(userData: Partial<UsersEntity>) {
    const user = this.usersRepository.create(userData);
    const savedUser = await this.usersRepository.save(user);

    await this.basketService.createBasket(savedUser);

    return {
      user: savedUser,
      refreshToken: await this.authService.generateRefreshToken(savedUser),
      token: await this.authService.generateToken(savedUser),
    };
  }

  async updateUser(userJwt: AuthJwtPayload, updateUser: UpdateUserDto) {
    const updatedFields: Partial<UsersEntity> = {};
    
    if (updateUser.age) {
        updatedFields.age = updateUser.age;
    }
    if (updateUser.email) {
        updatedFields.email = updateUser.email;
    }
    if (updateUser.name) {
        updatedFields.name = updateUser.name;
    }
    if (updateUser.phone_number) {
        updatedFields.phone_number = updateUser.phone_number;
    }

    if (!Object.keys(updatedFields).length) {
        return this.getUserById(userJwt.id);
    }

    return await this.usersRepository.update(userJwt.id, updatedFields);
  }

  async updateSelectedAddress(userJwt: AuthJwtPayload, address: AddressesEntity) {
    return await this.usersRepository.update(userJwt.id, { selectedAddress: address })
  }

  async login(userJwt: AuthJwtPayload) {
    const user = await this.getUserById(userJwt.id);
    
    return {
      user: user,
      refreshToken: await this.authService.generateRefreshToken(user),
      token: await this.authService.generateToken(user),
    };
  }
}