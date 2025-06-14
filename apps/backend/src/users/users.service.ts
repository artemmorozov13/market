import { BadRequestException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BasketService } from 'src/basket/basket.service';
import { Repository } from 'typeorm';
import { GetQueryParamsDto } from './dto/get-query-params.dto';
import { TelegramUtils } from 'src/utils/telegram.utils';
import { AuthService } from 'src/auth/auth.service';
import { UsersEntity } from '@core/entities/users.entity';
import { OrderEntity } from '@core/entities/order.entity';
import { AuthJwtPayload } from '@core/types/user-type';
import { StoreService } from '@app/store/store.service';

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
    private readonly storeService: StoreService
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
      ]
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

  async updateUser(updateUser: Partial<UsersEntity>) {
    try {
      const user = await this.getUserById(updateUser.id)

      if (!user) {
        throw new BadRequestException("Пользователь не найден");
      }

      Object.assign(user, updateUser);
      await this.usersRepository.update(user.id, user);
      
      return user
    } catch (error) {
      throw error
    }
  }

  async loginWithTelegram(initData: string, storeId: number) {
    const store = await this.storeService.getStoreDataById(storeId);

    if (!store) {
      throw new NotFoundException("Не удалось определить магазин");
    }

    // const isValid = await TelegramUtils.validateInitData(initData);
    // if (!isValid) {
    //   throw new Error('Invalid Telegram data');
    // }

    const telegramUser = TelegramUtils.parseInitData(initData);

    let user = await this.usersRepository.findOne({
      where: { telegram_id: telegramUser.id },
      relations: [
        'selectedProducts',
        'store'
      ]
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