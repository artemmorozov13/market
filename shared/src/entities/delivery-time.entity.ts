import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { PickupPoint } from './pickup-point.entity';

@Entity()
export class DeliveryTime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], 
    comment: 'День недели' 
  })
  dayOfWeek: string;

  @Column({ type: 'time', comment: 'Время начала доставки в формате HH:MM' })
  startTime: string;

  @Column({ type: 'time', comment: 'Время окончания доставки в формате HH:MM' })
  endTime: string;

  @Column({ default: true, comment: 'Активно ли время для выбора' })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => PickupPoint, pickupPoint => pickupPoint.deliveryTimes, { 
    onDelete: 'CASCADE'
  })
  pickupPoint: PickupPoint;
}