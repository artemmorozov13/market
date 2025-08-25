import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UsersEntity } from './users.entity';

@Entity()
export class AddressesEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullAddress: string;

  @Column()
  entrance: string;

  @Column()
  floor: string;

  @Column()
  apartment: string;

  @Column()
  intercom: string;

  @Column({ nullable: true })
  comment?: string;

  @Column({ type: 'varchar', nullable: true })
  postal_code: string;

  @Column({ type: 'varchar', nullable: false })
  fias_id: string

  @Column({ type: 'varchar', nullable: false })
  geo_lat: string

  @Column({ type: 'varchar', nullable: false })
  geo_lon: string
  
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
  
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToOne(() => UsersEntity, user => user.selectedAddress)
  selectedByUser: UsersEntity;

  @ManyToOne(() => UsersEntity, user => user.addresses)
  user: UsersEntity;
}