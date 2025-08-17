import { StoreUserEntity } from '@core/entities/store-user.entity';
import { BadRequestException, ConflictException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { StoreService } from '@app/store/store.service';
import * as bcrypt from "bcryptjs"
import { Roles } from '@core/enums/role-enum';
import { AuthJwtPayload } from '@core/types/user-type';
import { DeleteParamsDto } from './dto/delete-patams.dto';
import { ProductStatusEnum } from '@core/enums/product-status-enum';
import { TelegramLoginDto } from './dto/telegram-connect.dto';
import { TelegramUtils } from '@app/utils/telegram.utils';
import { AuthService } from '@app/auth/auth.service';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class StoreUserService {
    constructor(
        @InjectRepository(StoreUserEntity)
        private readonly storeUserRepository: Repository<StoreUserEntity>,
        private readonly telegramUtils: TelegramUtils,
        private readonly authService: AuthService,
    ) {}

    async getStoreUserByEmail(email: string) {
        const user = await this.storeUserRepository.findOne({
            where: {
                email: email
            },
            relations: ["store"]
        })

        if (!user) {
            throw new BadRequestException("Польщователь с этими учетными данными не найден")
        }

        return user
    }

    async getStoreUserById(userId: number) {
        const user = await this.storeUserRepository.findOne({
            where: {
                id: userId
            },
            relations: ['store']
        })

        if (!user) {
            throw new BadRequestException("Пользователь не найден")
        }
        
        return user
    }

    async connectTelegram(userJwt: AuthJwtPayload, telegramUser: TelegramLoginDto) {
        const isValid = this.telegramUtils.validateInitDataObject(telegramUser)
        const findUser = await this.storeUserRepository.findOne({ where: { telegram_id: telegramUser.id }});
    
        if (!isValid) {
            throw new BadRequestException('Invalid Telegram Data');
        }
    
        if (findUser) {
            const refreshToken = await this.authService.generateRefreshToken(findUser);
            const token = await this.authService.generateToken(findUser);

            return {
                user: findUser,
                token: token,
                refreshToken: refreshToken,
            };
        }
    
        if (!findUser) {
            const options: FindOptionsWhere<StoreUserEntity> = {
                id: userJwt.id
            }
            const payload: QueryDeepPartialEntity<StoreUserEntity> = {
                telegram_id: telegramUser.id,
                telegram_username: telegramUser.username,
            }
            await this.storeUserRepository.update(options, payload)

            const user = await this.getStoreUserById(userJwt.id)
            const token = await this.authService.generateToken(user);
            const refreshToken = await this.authService.generateRefreshToken(user);

            return {
                user,
                refreshToken,
                token,
            };
        }
    }

    async createUser(body: CreateUserDto) {
        const existingUser = await this.storeUserRepository.findOne({
            where: { email: body.email },
        });

        if (existingUser) {
            throw new ConflictException('Пользователь с такой почтой уже существует');
        }

        const hashedPassword = await bcrypt.hash('123456', 10);

        const user = this.storeUserRepository.create({
            email: body.email,
            password: hashedPassword,
            role: Roles.Admin
        });

        return this.storeUserRepository.save(user);
    }

    async getVendorList(userJwt: AuthJwtPayload) {
        const user = await this.getStoreUserById(userJwt.id);

        return this.storeUserRepository
            .createQueryBuilder('vendor')
            .leftJoinAndSelect(
                'vendor.products', 
                'product',
                'product.status != :hiddenStatus AND product.status != :expiredStatus',
                {
                    hiddenStatus: ProductStatusEnum.Hidden,
                    expiredStatus: ProductStatusEnum.Expired
                }
            )
            .where('vendor.store = :storeId', { storeId: user.store.id })
            .andWhere('vendor.role = :role', { role: Roles.Vendor })
            .getMany();
    }

    async createVendorUser(userJwt: AuthJwtPayload, body: CreateUserDto) {
        const user = await this.getStoreUserById(userJwt.id)
        const existingUser = await this.storeUserRepository.findOne({
            where: {
                email: body.email,
                store: user.store
            },
        });

        if (existingUser) {
            throw new ConflictException('Пользователь с такой почтой уже существует');
        }

        const hashedPassword = await bcrypt.hash(body.password, 10);

        const createdUser = this.storeUserRepository.create({
            email: body.email,
            password: hashedPassword,
            role: Roles.Vendor,
            store: user.store
        });

        return this.storeUserRepository.save(createdUser);
    }

    async deleteVendor(userJwt: AuthJwtPayload, params: DeleteParamsDto) {
        const user = await this.getStoreUserById(userJwt.id);

        const vendor = await this.storeUserRepository.findOne({
            where: {
                id: params.vendorId,
                store: user.store
            }
        })

        return await this.storeUserRepository.delete(vendor.id)
    }
}
