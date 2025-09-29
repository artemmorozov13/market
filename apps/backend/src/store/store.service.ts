import { StoreEntity } from '@core/entities/store.entity';
import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateStoreDto } from './dto/updatestore.dto';
import { AuthJwtPayload } from '@core/types/user-type';
import { StoreUserService } from '@app/store-user/store-user.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { Roles } from '@core/enums/role-enum';
import { ProductStatusEnum } from '@core/enums/product-status-enum';

@Injectable()
export class StoreService {
    constructor(
        @InjectRepository(StoreEntity)
        private readonly storeRepository: Repository<StoreEntity>,
        @Inject(forwardRef(() => StoreUserService))
        private readonly storeUserService: StoreUserService,
    ) {}

    async getStoreUserByToken(userJwt: AuthJwtPayload, page: number, limit: number) {
        page = Math.max(1, Number(page) || 1);
        limit = Math.max(1, Math.min(Number(limit), 100) || 10);

        const [stores, total] = await this.getStoresDataWithPagination(
            userJwt, 
            page, 
            limit
        );

        return {
            data: stores,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    }

    async getStoresDataWithPagination(
        userJwt: AuthJwtPayload, 
        page: number = 1, 
        limit: number = 10
    ): Promise<[StoreEntity[], number]> {
        const skip = (page - 1) * limit;

        const query = this.storeRepository
        .createQueryBuilder('store')
        // .innerJoin('store.users', 'user', 'user.id = :userId', { userId: userJwt.id })
        .leftJoinAndSelect(
            'store.products', 
            'product',
            'product.status IN (:...statuses)',
            { statuses: [ProductStatusEnum.Accepted, ProductStatusEnum.Active] }
        )
        .orderBy('store.name', 'ASC')
        .addOrderBy('product.name', 'ASC');

        const [stores, total] = await query
        .skip(skip)
        .take(limit)
        .getManyAndCount();

        return [stores, total];
    }

    async getStoreDataById(storeId: number) {
        const store = await this.storeRepository.findOne({
            where: {
                id: storeId
            }
        })
        if (!store) {
            throw new BadRequestException("Данные магазина не найдены")
        }
        return store
    }

    async createStore(body: CreateStoreDto) {
        // 1. Создаем пользователя с указанной почтой и стандартным паролем
        const newUser = await this.storeUserService.createUser({
            email: body.userEmail,
        });

        // 2. Создаем магазин и привязываем к нему пользователя
        const store = this.storeRepository.create({
            name: body.name,
            description: body.description,
            logoUrl: body.logoUrl,
            telegramBotToken: body.telegramBotToken,
            isDeliveryFree: true,
            staff: [newUser], // Важно: staff должен быть массивом!
        });

        return this.storeRepository.save(store);
    }

    async updateStoreData(userJwt: AuthJwtPayload, body: UpdateStoreDto) {
        // 1. Получаем текущего пользователя (с магазином)
        const user = await this.storeUserService.getStoreUserById(userJwt.id);

        // 2. Проверяем, что пользователь — владелец магазина
        if (user.role !== Roles.Admin) {
            throw new ForbiddenException('Только владелец магазина может изменять данные');
        }

        // 3. Находим магазин, который принадлежит пользователю
        const store = await this.storeRepository.findOne({
            where: { id: body.id, staff: { id: user.id } }, // Магазин, где user есть в staff
            relations: ['staff'], // Подгружаем сотрудников
        });

        if (!store) {
            throw new BadRequestException('Магазин не найден или у вас нет прав');
        }

        if (body.isDeliveryFree) {
            body.deliveryCost = 0;
            body.deliveryFreeFromLimit = 0;
        }

        // 4. Обновляем магазин
        await this.storeRepository.update(store.id, body);

        // 5. Возвращаем обновленные данные
        return this.storeRepository.findOne({ 
            where: { id: store.id },
            relations: ['staff'],
        });
    }

    async getStoreTelegramBotToken(storeId: number) {
        const store = await this.getStoreDataById(storeId);
        return store.telegramBotToken;
    }
}
