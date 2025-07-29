import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { OrderEntity } from "./order.entity";
import { UsersEntity } from "./users.entity";
import { ProductEntity } from "./product.entity";

@Entity()
export class OrderedProductsEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 1 })
    quantity: number;

    @ManyToOne(() => ProductEntity, (product) => product.orderedProducts)
    product: ProductEntity;

    @ManyToOne(() => UsersEntity, (user) => user.ordered_products)
    user: UsersEntity;

    @ManyToOne(() => OrderEntity, (order) => order.ordered_products, { onDelete: "CASCADE" })
    order: OrderEntity;
}
