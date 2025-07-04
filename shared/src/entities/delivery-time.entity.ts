import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { DeliveryArea } from './delivery-area.entity';
import { WeekdayEnum } from '../enums/weekday.enum';

@Entity()
export class DeliveryTime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: WeekdayEnum, 
    comment: 'День недели' 
  })
  dayOfWeek: WeekdayEnum;

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

  @ManyToOne(() => DeliveryArea, deliveryArea => deliveryArea.deliveryTimes, { 
    onDelete: 'CASCADE'
  })
  deliveryArea: DeliveryArea;
}