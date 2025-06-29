import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PickupPointEntity } from "./pickup-point.entity";
import { WeekdayEnum } from "../enums/weekday.enum";

@Entity({ name: 'pickup_working_hours' })
export class PickupWorkingHoursEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'enum', enum: WeekdayEnum })
    dayOfWeek: WeekdayEnum;
    
    @Column({ type: 'time' })
    openingTime: string;
    
    @Column({ type: 'time' })
    closingTime: string;

    @ManyToOne(() => PickupPointEntity, pickupPoint => pickupPoint.workingHours)
    @JoinColumn({ name: 'pickup_point_id' })
    pickupPoint: PickupPointEntity;
}