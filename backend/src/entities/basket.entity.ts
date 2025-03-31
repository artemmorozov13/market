import { Column, Entity, JoinColumn, OneToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UsersEntity } from './users.entity';
import { SelectedProductEntity } from './selected-product.entity';

@Entity({ name: 'basket' })
export class BasketEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  products_count: number;

  @Column()
  telegram_id: number

  @OneToOne(() => UsersEntity, (user) => user.basket, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UsersEntity;

  @OneToMany(() => SelectedProductEntity, (selectedProduct) => selectedProduct.basket, { cascade: true })
  selectedProducts: SelectedProductEntity[];
}
