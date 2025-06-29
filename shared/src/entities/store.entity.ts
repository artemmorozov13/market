import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { StoreUserEntity } from "./store-user.entity";
import { UsersEntity } from "./users.entity";
import { ProductEntity } from "./product.entity";
import { OrderEntity } from "./order.entity";
import { SelectedProductEntity } from "./selected-product.entity";
import { StoreDeliveryStrategy } from "./store-delivery-strategy.entity";
import { DeliveryArea } from "./delivery-area.entity";

@Entity({ name: "store" })
export class StoreEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ type: "boolean" })
    isDeliveryFree: boolean

    @Column({ type: 'float', default: 0 })
    deliveryCost: number;

    @Column({ type: "float", default: 0 })
    deliveryFreeFromLimit: number

    @Column({ nullable: true })
    telegramBotToken: string;

    @Column({ nullable: true })
    logoUrl: string;

    @Column({ default: true })
    isWeekLimited: boolean

    @Column({ 
        type: 'int', 
        default: 25, 
        comment: 'Минимальное время (в часах) между оформлением заказа и началом доставки. 0 - нет ограничений' 
    })
    minOrderBeforeDeliveryHours: number;

    @Column({ 
        type: 'varchar', 
        default: 'Europe/Moscow',
        comment: 'Часовой пояс магазина (например, Europe/Moscow)' 
    })
    timezone: string;

    @OneToMany(() => UsersEntity, user => user.store)
    users: UsersEntity[];

    @OneToMany(() => ProductEntity, product => product.store)
    products: ProductEntity[]

    @OneToMany(() => StoreUserEntity, user => user.store)
    staff: StoreUserEntity[]

    @OneToMany(() => DeliveryArea, deliveryArea => deliveryArea.store)
    deliveryAreas: DeliveryArea[]

    @OneToMany(() => OrderEntity, order => order)
    orders: OrderEntity[]

    @OneToMany(() => StoreDeliveryStrategy, storeStrategy => storeStrategy.store)
    deliveryStrategies: StoreDeliveryStrategy[]

    @OneToMany(() => SelectedProductEntity, selectedProduct => selectedProduct.store)
    selectedProducts: SelectedProductEntity[]
}