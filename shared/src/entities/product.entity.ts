import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn, JoinTable, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { SelectedProductEntity } from "./selected-product.entity";
import { OrderedProductsEntity } from "./ordered-products.entity";
import { StoreEntity } from "./store.entity";
import { ProductStatusEnum } from "../enums/product-status-enum";
import { UnitOfMeasuresEnum } from "../enums/units-of-measures";
import { StoreUserEntity } from "./store-user.entity";

@Entity({ name: "product" })
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column("decimal", { precision: 10, scale: 2, default: null, nullable: true })
  price: number;

  @Column("decimal", { precision: 10, scale: 2, default: null, nullable: true })
  offeredPrice: number;

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

  @Column({ type: 'enum', enum: UnitOfMeasuresEnum, default: UnitOfMeasuresEnum.PIECES })
  unitOfMeasurement: UnitOfMeasuresEnum;

  @Column({ default: '' })
  canelComment: string

  @Column({ type: 'enum', enum: ProductStatusEnum, default: ProductStatusEnum.Active })
  status: ProductStatusEnum

  @OneToMany(() => SelectedProductEntity, (selectedProduct) => selectedProduct.product)
  selectedProducts: SelectedProductEntity[]

  @OneToMany(() => OrderedProductsEntity, (orderedProducts) => orderedProducts.product)
  orderedProducts: OrderedProductsEntity[]

  @ManyToOne(() => StoreEntity, store => store.products)
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @ManyToOne(() => StoreUserEntity, (storeUser) => storeUser.products)
  @JoinColumn({ name: 'created_by_store_user_id' })
  storeUser: StoreUserEntity
}