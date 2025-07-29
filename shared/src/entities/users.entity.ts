import * as bcrypt from "bcryptjs"
import {
    BeforeInsert,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { BasketEntity } from "./basket.entity";
import { OrderEntity } from "./order.entity";
import { SelectedProductEntity } from "./selected-product.entity";
import { OrderedProductsEntity } from "./ordered-products.entity";
import { AddressesEntity } from "./addresses.entity";
import { Roles } from "../enums/role-enum";
import { StoreEntity } from "./store.entity";

@Entity({ name: "users" })
export class UsersEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'bigint', nullable: true })
    telegram_id?: number;

    @Column({ nullable: true, default: null })
    telegram_username: string | null

    @Column({ nullable: true, default: null })
    name: string | null

    @Column({ nullable: true, default: null })
    phone_number: string | null

    @Column({ default: false })
    is_phone_confirmed: boolean

    @Column({ nullable: true, default: null })
    email: string | null

    @Column({ default: null, nullable: true })
    login: string | null

    @Column({ nullable: true, default: null})
    age: number | null

    @Column({ nullable: true, default: null })
    password: string | null

    @Column({
        default: Roles.User,
        type: 'enum',
        enum: Roles
    })
    role: Roles

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    @OneToOne(() => AddressesEntity)
    @JoinColumn()
    selectedAddress: AddressesEntity;

    @OneToOne(() => BasketEntity, (basketEntity) => basketEntity.user, { cascade: true })
    basket: BasketEntity

    @OneToMany(() => OrderEntity, (order) => order.user)
    orders: OrderEntity[]

    @ManyToOne(() => StoreEntity, store => store.users)
    @JoinColumn({ name: 'store_id' }) 
    store: StoreEntity;

    @OneToMany(() => AddressesEntity, (address) => address.user)
    addresses: AddressesEntity[]

    @OneToMany(() => SelectedProductEntity, (selectedProductEntity) => selectedProductEntity.user)
    selectedProducts: SelectedProductEntity[]

    @OneToMany(() => OrderedProductsEntity, (orederedProducts) => orederedProducts.user)
    ordered_products: OrderedProductsEntity[]

    @BeforeInsert()
    async hashPasword() {
        if (this.password) {
            this.password = await bcrypt.hash(this.password, 10)
        }
    }

    @BeforeInsert()
    generateDefaultLogin() {
        if (!this.login) {
            this.login = `user-${this.id}`
        }
    }
}
