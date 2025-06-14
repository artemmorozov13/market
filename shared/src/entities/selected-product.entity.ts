import { Entity, ManyToOne, PrimaryGeneratedColumn, Column } from "typeorm";
import { UsersEntity } from "./users.entity";
import { BasketEntity } from "./basket.entity";
import { ProductEntity } from "./product.entity";
import { StoreEntity } from "./store.entity";

@Entity({ name: "selected-products" })
export class SelectedProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @Column({ default: 1 })
  quantity: number;

  @Column({ type: 'bigint' })
  userTgchatId: number;

  @ManyToOne(() => BasketEntity, (basket) => basket.selectedProducts, { onDelete: "CASCADE" })
  basket: BasketEntity;

  @ManyToOne(() => UsersEntity, (user) => user.selectedProducts, { onDelete: "CASCADE" })
  user: UsersEntity;

  @ManyToOne(() => ProductEntity, (product) => product.selectedProducts)
  product: ProductEntity

  @ManyToOne(() => StoreEntity, store => store.selectedProducts)
  store: StoreEntity
}
