import { Inject, Injectable, NotFoundException, UnauthorizedException, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BasketService } from 'src/basket/basket.service';
import { UsersEntity } from 'src/entities/users.entity';
import { Repository } from 'typeorm';
import { GetQueryParamsDto } from './dto/get-query-params.dto';
import { TelegramUtils } from 'src/utils/telegram.utils';
import { AuthService } from 'src/auth/auth.service';
import { OrderEntity } from 'src/entities/order.entity';
import { TelegramAuthData } from 'src/telegram/types/telegram-user-types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    private readonly basketService: BasketService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService
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

  async findUserByEmail(email: string) {
    return await this.usersRepository.findOne({
      where: {
        email: email,
      }
    })
  }

  async loginWithTelegram(initData: string) {
    const isValid = await TelegramUtils.validateInitData(initData);
    if (!isValid) {
      throw new Error('Invalid Telegram data');
    }

    const telegramUser = TelegramUtils.parseInitData(initData);

    let user = await this.usersRepository.findOne({
      where: { telegram_id: telegramUser.id },
      relations: ['selectedProducts']
    });

    if (!user) {
      user = this.usersRepository.create({
          telegram_id: telegramUser.id,
          name: telegramUser.first_name,
          email: "",
          telegram_username: telegramUser.username || "",
          password: "123456",
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