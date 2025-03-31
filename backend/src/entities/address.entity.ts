import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, } from 'typeorm';
import { UsersEntity } from './users.entity';

@Entity({ name: 'address' })
export class AddressEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  addressString: string;

  @ManyToOne(() => UsersEntity, (user) => user.addresses, { onDelete: 'CASCADE' })
  user: UsersEntity;
}