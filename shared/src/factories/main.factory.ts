import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { UsersEntity } from "../entities/users.entity";
import { AddressesEntity } from "../entities/addresses.entity";
import { StoreEntity } from "../entities/store.entity";
import { StoreUserEntity } from "../entities/store-user.entity";
import { DeliveryArea, DeliveryStrategy, DeliveryTime, PickupPointEntity, PickupWorkingHoursEntity, ProductEntity, StoreDeliveryStrategy } from "../entities";
import { DeliveryStrategyEnum, WeekdayEnum } from "../enums";
import { fakerEN } from '@faker-js/faker';

export const customFaker = fakerEN;

export class MainFactory implements Seeder {
    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<void> {

        // 1. Создаем или получаем существующие стратегии доставки
        const [deliveryStrategy, pickupStrategy] = await this.ensureDeliveryStrategies(dataSource);

        // 2. Создаем магазины и сразу связываем их со стратегиями
        const stores = await this.createStoresWithStrategies(
            dataSource, 
            factoryManager,
            [deliveryStrategy, pickupStrategy]
        );

        // 3. Создаем владельцев для магазинов
        await this.createStoreOwners(dataSource, factoryManager, stores);

        // 4. Создаем обычных пользователей с адресами
        await this.createUsersWithAddresses(dataSource, factoryManager);

        // 5. Создаем зоны доставки для магазинов
        await this.createDeliveryAreasForStores(dataSource, factoryManager);

        // 6. Создаем пункты выдачи для магазинов
        await this.createPickupPointsForStores(dataSource, factoryManager);

        // 7. Создаем продукты для магазинов
        await this.createProductsForStores(dataSource, factoryManager);
    }

    private async ensureDeliveryStrategies(dataSource: DataSource) {
        const strategyRepository = dataSource.getRepository(DeliveryStrategy);
        
        let deliveryStrategy = await strategyRepository.findOneBy({ 
            type: DeliveryStrategyEnum.DeliveryToEntrance 
        });
        let pickupStrategy = await strategyRepository.findOneBy({ 
            type: DeliveryStrategyEnum.PickupByYourself 
        });

        if (!deliveryStrategy) {
            deliveryStrategy = await strategyRepository.save({
                type: DeliveryStrategyEnum.DeliveryToEntrance,
                title: "Доставка до подъезда"
            });
        }

        if (!pickupStrategy) {
            pickupStrategy = await strategyRepository.save({
                type: DeliveryStrategyEnum.PickupByYourself,
                title: "Самовывоз"
            });
        }

        return [deliveryStrategy, pickupStrategy];
    }

    private async createStoresWithStrategies(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager,
        strategies: [DeliveryStrategy, DeliveryStrategy]
    ) {
        // Используем кастомный Faker для фабрики
        const storeFactory = factoryManager.get(StoreEntity);
        const storeDeliveryStrategyRepository = dataSource.getRepository(StoreDeliveryStrategy);
        
        const stores = await storeFactory.saveMany(50);
        
        for (const store of stores) {
            const availableStrategies = this.getAvailableStrategiesForStore(strategies);
            
            for (const strategy of availableStrategies) {
                await storeDeliveryStrategyRepository.save({
                    store,
                    strategy
                });
            }
        }

        console.log(`Created ${stores.length} stores with delivery strategies`);
        return stores;
    }

    private getAvailableStrategiesForStore(strategies: [DeliveryStrategy, DeliveryStrategy]): DeliveryStrategy[] {
        const random = Math.random();
        
        if (random < 0.7) return strategies;
        if (random < 0.9) return [strategies[0]];
        return [strategies[1]];
    }

    private async createStoreOwners(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager,
        stores: StoreEntity[]
    ) {
        const storeUserFactory = factoryManager.get(StoreUserEntity);
        
        for (const store of stores) {
            const ownerCount = Math.floor(Math.random() * 2) + 1;
            await storeUserFactory.saveMany(ownerCount, { store });
        }
        
        console.log(`Created owners for ${stores.length} stores`);
    }

    private async createUsersWithAddresses(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ) {
        const userFactory = factoryManager.get(UsersEntity);
        const addressFactory = factoryManager.get(AddressesEntity);
        const users = await userFactory.saveMany(10);
        
        for (const user of users) {
            const addressCount = Math.floor(Math.random() * 3) + 1;
            const addresses = await addressFactory.saveMany(addressCount, { user });
            
            if (addresses.length > 0) {
                user.selectedAddress = addresses[Math.floor(Math.random() * addresses.length)];
                await dataSource.getRepository(UsersEntity).save(user);
            }
        }
        
        console.log(`Created ${users.length} users with addresses`);
    }

    private async createDeliveryAreasForStores(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ) {
        const deliveryAreaFactory = factoryManager.get(DeliveryArea);
        const deliveryTimeFactory = factoryManager.get(DeliveryTime);
        const storeRepository = dataSource.getRepository(StoreEntity);
        
        const stores = await storeRepository.find();
        
        for (const store of stores) {
            const deliveryAreas = await deliveryAreaFactory.saveMany(5, { store });
            
            for (const area of deliveryAreas) {
                const daysToCreate = [WeekdayEnum.MONDAY, WeekdayEnum.WEDNESDAY, WeekdayEnum.FRIDAY];
                
                for (const day of daysToCreate) {
                    await deliveryTimeFactory.saveMany(3, { 
                        deliveryArea: area,
                        dayOfWeek: day
                    });
                }
            }
        }
        
        console.log(`Created delivery areas for ${stores.length} stores`);
    }

    private async createPickupPointsForStores(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ) {
        const pickupPointFactory = factoryManager.get(PickupPointEntity);
        const workingHoursFactory = factoryManager.get(PickupWorkingHoursEntity);
        const storeRepository = dataSource.getRepository(StoreEntity);
        
        const stores = await storeRepository.find();
        
        for (const store of stores) {
            const pickupPoints = await pickupPointFactory.saveMany(3, { store });
            
            for (const point of pickupPoints) {
                const daysToCreate = [WeekdayEnum.MONDAY, WeekdayEnum.WEDNESDAY, WeekdayEnum.FRIDAY];
                
                for (const day of daysToCreate) {
                    await workingHoursFactory.save({
                        pickupPoint: point,
                        dayOfWeek: day
                    });
                }
            }
        }
        
        console.log(`Created pickup points for ${stores.length} stores`);
    }

    private async createProductsForStores(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ) {
        const productFactory = factoryManager.get(ProductEntity);
        const storeRepository = dataSource.getRepository(StoreEntity);
        
        const stores = await storeRepository.find();
        
        for (const store of stores) {
            await productFactory.saveMany(15, { store });
        }
        
        console.log(`Created active products for ${stores.length} stores`);
    }
}