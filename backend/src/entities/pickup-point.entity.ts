import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  OneToMany, 
  CreateDateColumn, 
  UpdateDateColumn,
  DeleteDateColumn 
} from 'typeorm';
import { DeliveryTime } from './delivery-time.entity';

@Entity()
export class PickupPoint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'Название пункта выдачи' })
  name: string;

  @Column({ default: 5000 })
  radius: number

  @Column({ nullable: true })
  fullAddress: string;

  @Column({ type: 'varchar', nullable: true })
  postal_code: string;

  @Column({ type: 'varchar', nullable: true })
  fias_id: string

  @Column({ type: 'varchar', nullable: true })
  geo_lat: string

  @Column({ type: 'varchar', nullable: true })
  geo_lon: string

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

  @OneToMany(() => DeliveryTime, deliveryTime => deliveryTime.pickupPoint, { 
    cascade: true,
  })
  deliveryTimes: DeliveryTime[];
}