import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { StoreEntity } from "./store.entity";
import { Roles } from "../enums/role-enum";

@Entity({ name: "store-user" })
export class StoreUserEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    email: string;

    @Column()
    password: string

    @Column({
        default: Roles.Admin,
        type: 'enum',
        enum: Roles
    })
    role: Roles

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => StoreEntity, store => store.staff)
    @JoinColumn({ name: 'store_id' })
    store: StoreEntity
}