import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UsersEntity } from "./users.entity";
import { ProductEntity } from "./product.entity";
import { OrderedProductsEntity } from "./ordered-products.entity";
import { PickupPoint } from "./pickup-point.entity";
import { DeliveryTime } from "./delivery-time.entity";

@Entity({ name: "order" })
export class OrderEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "enum", enum: ["waitForPay", "payConfirm", "finished"], default: "waitForPay" })
    status: "waitForPay" | "payConfirm" | "finished";

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column()
    address: string;

    @Column()
    phoneNumber: string;

    @Column({ nullable: true })
    comment?: string;

    @ManyToOne(() => PickupPoint)
    pickupPoint: PickupPoint;

    @ManyToOne(() => DeliveryTime)
    deliveryTime: DeliveryTime;

    @ManyToOne(() => UsersEntity, (user) => user.orders)
    user: UsersEntity;

    @OneToMany(() => OrderedProductsEntity, (orderedProducts) => orderedProducts.order, { cascade: true })
    ordered_products: OrderedProductsEntity[];
}