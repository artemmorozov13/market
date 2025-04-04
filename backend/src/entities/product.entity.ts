import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn, JoinTable, OneToMany } from "typeorm";
import { OrderEntity } from "./order.entity";
import { BasketEntity } from "./basket.entity";
import { SelectedProductEntity } from "./selected-product.entity";
import { OrderedProductsEntity } from "./ordered-products.entity";

@Entity({ name: "product" })
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column("decimal", { precision: 10, scale: 2 })
  price: number;

  @Column("decimal", { precision: 5, scale: 2 })
  discount: number;

  @Column()
  image: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  unitValue: number

  @Column()
  unitOfMeasurement: "гр" | "кг" | "шт";

  @Column()
  is_expired: boolean

  @OneToMany(() => SelectedProductEntity, (selectedProduct) => selectedProduct.product)
  selectedProducts: SelectedProductEntity[]

  @OneToMany(() => OrderedProductsEntity, (orderedProducts) => orderedProducts.product)
  orderedProducts: OrderedProductsEntity[]

}