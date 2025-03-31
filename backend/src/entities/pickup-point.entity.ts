import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  OneToMany, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { DeliveryTime } from './delivery-time.entity';

@Entity()
export class PickupPoint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'Название пункта выдачи' })
  name: string;

  @Column({ type: 'text', nullable: true, comment: 'Адрес пункта выдачи' })
  address?: string;

  @Column({ type: 'point', nullable: true, comment: 'Координаты пункта (широта, долгота)' })
  coordinates?: string;

  @Column({ default: true, comment: 'Активен ли пункт выдачи' })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => DeliveryTime, deliveryTime => deliveryTime.pickupPoint, { 
    cascade: true,
    eager: false
  })
  deliveryTimes: DeliveryTime[];
}