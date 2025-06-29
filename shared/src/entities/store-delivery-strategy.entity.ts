import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { StoreEntity } from "./store.entity";
import { DeliveryStrategy } from "./delivery-strategy.entity";

@Entity()
export class StoreDeliveryStrategy {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => StoreEntity, store => store.deliveryStrategies)
    @JoinColumn({ name: 'store_id' })
    store: StoreEntity

    @ManyToOne(() => DeliveryStrategy, strategy => strategy.storeStrategies)
    @JoinColumn({ name: 'strategy_id' })
    strategy: DeliveryStrategy
}