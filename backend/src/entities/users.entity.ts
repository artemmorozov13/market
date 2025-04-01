import { BeforeInsert, Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { BasketEntity } from "./basket.entity";
import { OrderEntity } from "./order.entity";
import { AddressEntity } from "./address.entity";
import { SelectedProductEntity } from "./selected-product.entity";
import { OrderedProductsEntity } from "./ordered-products.entity";
import * as bcrypt from "bcrypt"

@Entity({ name: "users" })
export class UsersEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'bigint' })
    telegram_id: number;

    @Column({ default: "" })
    telegram_username: string

    @Column()
    name: string

    @Column({ default: "" })
    phone_number: string

    @Column({ default: false })
    is_phone_confirmed: boolean

    @Column()
    email: string

    @Column({ default: 0 })
    age: number

    @Column({ default: "" })
    password: string

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    @OneToOne(() => BasketEntity, (basketEntity) => basketEntity.user, { cascade: true })
    basket: BasketEntity

    @OneToMany(() => OrderEntity, (order) => order.user)
    orders: OrderEntity[]

    @OneToMany(() => AddressEntity, (address) => address.user)
    addresses: AddressEntity[]

    @OneToMany(() => SelectedProductEntity, (selectedProductEntity) => selectedProductEntity.user)
    selectedProducts: SelectedProductEntity[]

    @OneToMany(() => OrderedProductsEntity, (orederedProducts) => orederedProducts.user)
    ordered_products: OrderedProductsEntity[]

    @BeforeInsert()
    async hashPasword() {
        this.password = await bcrypt.hash(this.password, 10)
    }
}
