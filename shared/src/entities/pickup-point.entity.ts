import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { DeliveryTime } from "./delivery-time.entity";
import { StoreEntity } from "./store.entity";
import { PickupWorkingHoursEntity } from "./pickup-working-hours.entity";
import { OrderEntity } from "./order.entity";

@Entity({ name: 'pickup_point' })
export class PickupPointEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ comment: 'Название зоны доставки' })
    name: string;

    @Column({ nullable: true })
    fullAddress: string;

    @Column({ type: 'varchar', nullable: true })
    postal_code: string;

    @Column({ type: 'varchar', nullable: true })
    fias_id: string;

    @Column({ type: 'varchar', nullable: true })
    geo_lat: string;

    @Column({ type: 'varchar', nullable: true })
    geo_lon: string;

    @Column({ 
        type: 'enum', 
        enum: ['active', 'deleted'],
        default: 'active',
        comment: 'Статус пункта выдачи' 
    })
    status: 'active' | 'deleted';

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @OneToMany(() => OrderEntity, order => order.pickupPoint)
    orders: OrderEntity[]

    @OneToMany(() => PickupWorkingHoursEntity, time => time.pickupPoint)
    workingHours: PickupWorkingHoursEntity[];

    @ManyToOne(() => StoreEntity, store => store.deliveryAreas)
    @JoinColumn({ name: 'store_id' })
    store: StoreEntity;
}
