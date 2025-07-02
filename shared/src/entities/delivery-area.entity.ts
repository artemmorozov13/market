import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  OneToMany, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DeliveryTime } from './delivery-time.entity';
import { StoreEntity } from './store.entity';
import { OrderEntity } from './order.entity';

@Entity()
export class DeliveryArea {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'Название зоны доставки' })
  name: string;

  @Column({ default: 5000 })
  radius: number;

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
    comment: 'Статус зоны доставки' 
  })
  status: 'active' | 'deleted';

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => DeliveryTime, deliveryTime => deliveryTime.deliveryArea, { 
    cascade: true,
  })
  deliveryTimes: DeliveryTime[];

  @OneToMany(() => OrderEntity, order => order.deliveryArea)
  orders: OrderEntity[]

  @ManyToOne(() => StoreEntity, store => store.deliveryAreas)
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity;
}