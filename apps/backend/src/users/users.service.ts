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

  async createUser(userData: Partial<UsersEntity>): Promise<UsersEntity> {
    const user = this.usersRepository.create(userData);
    const savedUser = await this.usersRepository.save(user);

    await this.basketService.createBasket(savedUser);

    return savedUser;
  }

  async updateUser(user: AuthJwtPayload, updateUser: UpdateUserDto) {
    // Логируем входящие данные для дебага
    console.log('Updating user with data:', { 
        userId: user.id, 
        updateData: updateUser 
    });

    const updatedFields: Partial<UsersEntity> = {};
    
    // Проверяем и добавляем только валидные поля
    if (updateUser.age !== undefined) {
        updatedFields.age = updateUser.age;
    }
    if (updateUser.email !== undefined) {
        updatedFields.email = updateUser.email;
    }
    if (updateUser.name !== undefined) {
        updatedFields.name = updateUser.name;
    }
    if (updateUser.phone_number !== undefined) {
        updatedFields.phone_number = updateUser.phone_number;
    }

    // Если нет полей для обновления
    if (!Object.keys(updatedFields).length) {
        console.log('No valid fields to update');
        return this.getUserById(user.id);
    }

    try {
        await this.usersRepository.update(user.id, updatedFields);
        console.log('User updated successfully');
        return this.getUserById(user.id);
    } catch (error) {
        console.error('Update error:', error);
        throw new BadRequestException('Invalid user data');
    }
  }

  async updateSelectedAddress(userJwt: AuthJwtPayload, address: AddressesEntity) {
    return await this.usersRepository.update(userJwt.id, { selectedAddress: address })
  }

  async loginWithTelegram(initData: string, storeId: number, authorization?: string) {
    let store = null;
    
    try {
      const storeResponse = await this.storeService.getStoreDataById(storeId);
      store = storeResponse
    } catch (error) {
      store = null
    }

    if (initData) {
      const isValid = await this.telegramUtils.validateInitData(initData);
      if (!isValid) {
        throw new Error('Invalid Telegram data');
      }

      const telegramUser = await this.telegramUtils.parseInitData(initData);

      let user = await this.usersRepository.findOne({
        where: { telegram_id: telegramUser.id },
        relations: ['selectedProducts', 'selectedAddress', 'store', 'addresses']
      });

      if (!user) {
        user = this.usersRepository.create({
          telegram_id: telegramUser.id,
          name: telegramUser.first_name,
          email: "",
          telegram_username: telegramUser.username || "",
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

    if (!initData) {
      // Если есть заголовок Authorization
      if (authorization) {
        const token = authorization.split(' ')?.[1];

        // Проверяем, что токен не "undefined" (как строка) и не пустой
        if (!token || token === 'undefined') {
          throw new BadRequestException('Invalid token data');
        }

        try {
          // Пробуем верифицировать токен
          const user = await this.jwtService.verifyAsync(token);
          const dbUser = await this.getUserById(user.id);
          return {
            user: dbUser,
            refreshToken: await this.authService.generateRefreshToken(dbUser),
            token: await this.authService.generateToken(dbUser),
          };

        } catch (err) {
          // Если токен невалидный (истёк или поддельный), создаём нового пользователя
          console.warn('JWT verification failed, creating new user:', err.message);
        }
      }

      // Если нет authorization или токен невалидный → создаём нового пользователя
      const newUser = this.usersRepository.create({
        store,
        basket: {
          products_count: 0,
        },
      });

      await this.usersRepository.save(newUser);
      
      return {
        user: newUser,
        refreshToken: await this.authService.generateRefreshToken(newUser),
        token: await this.authService.generateToken(newUser),
      };
    }
  }
}