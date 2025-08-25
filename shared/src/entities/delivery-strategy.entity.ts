import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DeliveryStrategyEnum } from "../enums/delivery-strategy.enum";
import { StoreDeliveryStrategy } from "./store-delivery-strategy.entity";

@Entity()
export class DeliveryStrategy {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'enum', enum: DeliveryStrategyEnum })
    type: DeliveryStrategyEnum

    @Column()
    title: string

    @OneToMany(() => StoreDeliveryStrategy, storeStrategy => storeStrategy.strategy)
    storeStrategies: StoreDeliveryStrategy[]
}