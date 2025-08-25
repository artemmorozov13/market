import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { StoreEntity } from "./store.entity";
import { Roles } from "../enums/role-enum";
import { ProductEntity } from "./product.entity";

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

    @Column({ type: 'bigint', nullable: true })
    telegram_id?: number;

    @Column({ nullable: true, default: null })
    telegram_username: string | null

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => ProductEntity, product => product.storeUser)
    products: ProductEntity[]

    @ManyToOne(() => StoreEntity, store => store.staff)
    @JoinColumn({ name: 'store_id' })
    store: StoreEntity
}