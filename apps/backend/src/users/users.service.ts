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
import { AddressesEntity } from '@core/entities/addresses.entity';
import { AuthJwtPayload } from '@core/types/user-type';
import { UpdateUserDto } from './dto/update-user-dto';

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
    private readonly telegramUtils: TelegramUtils
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
      relations: ['addresses', 'selectedAddress', 'store']
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

  async createUser(userData: Partial<UsersEntity>): Promise<UsersEntity> {
    const user = this.usersRepository.create(userData);
    const savedUser = await this.usersRepository.save(user);

    await this.basketService.createBasket(savedUser);

    return savedUser;
  }

  async updateUser(user: AuthJwtPayload, updateUser: UpdateUserDto) {
    const updatedFields: UpdateUserDto = {};
    
    if (updateUser.age) updatedFields.age = updateUser.age;
    if (updateUser.email) updatedFields.email = updateUser.email;
    if (updateUser.name) updatedFields.name = updateUser.name;
    if (updateUser.phone_number) updatedFields.phone_number = updateUser.phone_number;

    if (!Object.keys(updatedFields).length) {
        return this.getUserById(user.id);
    }

    await this.usersRepository.update(user.id, updatedFields);
    return this.getUserById(user.id)
  }

  async updateSelectedAddress(userJwt: AuthJwtPayload, address: AddressesEntity) {
    return await this.usersRepository.update(userJwt.id, { selectedAddress: address })
  }

  async loginWithTelegram(initData: string, storeId: number) {
    const store = await this.storeService.getStoreDataById(storeId);

    const isValid = await this.telegramUtils.validateInitData(initData);
    if (!isValid) {
      throw new Error('Invalid Telegram data');
    }

    const telegramUser = await this.telegramUtils.parseInitData(initData);

    let user = await this.usersRepository.findOne({
      where: { telegram_id: telegramUser.id },
      relations: ['selectedProducts', 'store']
    });

    if (!user) {
      user = this.usersRepository.create({
        telegram_id: telegramUser.id,
        name: telegramUser.first_name,
        email: "",
        telegram_username: telegramUser.username || "",
        password: "123456",
        store,
        basket: {
          telegram_id: telegramUser.id,
          products_count: 0,
        },
      });
  
      await this.usersRepository.save(user);
    }

    return {
      user,
      token: await this.authService.generateToken(user),
    };
  }
}