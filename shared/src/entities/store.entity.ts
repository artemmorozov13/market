import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { StoreUserEntity } from "./store-user.entity";
import { UsersEntity } from "./users.entity";
import { ProductEntity } from "./product.entity";
import { OrderEntity } from "./order.entity";
import { SelectedProductEntity } from "./selected-product.entity";
import { StoreDeliveryStrategy } from "./store-delivery-strategy.entity";
import { DeliveryArea } from "./delivery-area.entity";
import { PickupPointEntity } from "./pickup-point.entity";

@Entity({ name: "store" })
export class StoreEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column()
    name: string;

    @Column({ nullable: true })
    description: string | null;

    @Column({ type: "boolean" })
    isDeliveryFree: boolean

    @Column({ type: 'float', default: 0 })
    deliveryCost: number;

    @Column({ type: "float", default: 0 })
    deliveryFreeFromLimit: number

    @Column({ nullable: true })
    telegramBotToken: string | null;

    @Column({ nullable: true })
    logoUrl: string | null;

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

    @Column({ type: 'boolean', default: false })
    isWorkWithPartners: boolean

    @Column({ nullable: true, default: null })
    imageUrl: string | null

    @Column({ type: 'varchar', default: null, nullable: true })
    helpTelegramAccount: string

    @OneToMany(() => UsersEntity, user => user.store)
    users: UsersEntity[];

    @OneToMany(() => ProductEntity, product => product.store)
    products: ProductEntity[]

    @OneToMany(() => StoreUserEntity, user => user.store)
    staff: StoreUserEntity[]

    @OneToMany(() => DeliveryArea, deliveryArea => deliveryArea.store)
    deliveryAreas: DeliveryArea[]

    @OneToMany(() => PickupPointEntity, pickupPoint => pickupPoint.store)
    pickupPoints: PickupPointEntity[]

    @OneToMany(() => OrderEntity, order => order)
    orders: OrderEntity[]

    @OneToMany(() => StoreDeliveryStrategy, storeStrategy => storeStrategy.store)
    deliveryStrategies?: StoreDeliveryStrategy[]

    @OneToMany(() => SelectedProductEntity, selectedProduct => selectedProduct.store)
    selectedProducts: SelectedProductEntity[]
}