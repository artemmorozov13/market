import { 
    Column, 
    CreateDateColumn, 
    Entity, 
    ManyToOne, 
    OneToMany, 
    PrimaryGeneratedColumn, 
    UpdateDateColumn,
    Index 
  } from "typeorm";
import { UsersEntity } from "./users.entity";
import { OrderedProductsEntity } from "./ordered-products.entity";
import { PickupPoint } from "./pickup-point.entity";
import { DeliveryTime } from "./delivery-time.entity";
import { OrderStatusEnum } from "../enums/order-status-enum";
import { StoreEntity } from "./store.entity";
  
  @Entity({ name: "order" })
  export class OrderEntity {
      @PrimaryGeneratedColumn()
      id: number;
  
      @Column({ 
        type: "enum", 
        enum: OrderStatusEnum, 
        default: OrderStatusEnum.WaitForPay
      })
      status: OrderStatusEnum;
  
      @CreateDateColumn()
      createdAt: Date;
  
      @UpdateDateColumn()
      updatedAt: Date;
  
      @Column({ type: 'date' })
      @Index()
      deliveryDate: Date;
  
      @Column({ type: 'varchar', length: 255 })
      address: string;

      @Column({ type: 'varchar', nullable: true, length: 255 })
      fullAddress: string;
  
      @Column({ type: 'varchar', length: 20 })
      phoneNumber: string;
  
      @Column({ type: 'text', nullable: true })
      comment?: string;

      @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
      totalAmount: number;

       @Column({ type: 'text', nullable: true, default: null })
      cancelReason?: string;
  
      @Column({ type: 'varchar', length: 50, nullable: true })
      paymentMethod?: string;
  
      @ManyToOne(() => PickupPoint, { onDelete: 'SET NULL' })
      pickupPoint: PickupPoint;
  
      @ManyToOne(() => DeliveryTime, { onDelete: 'SET NULL', nullable: true })
      deliveryTime?: DeliveryTime;

      @ManyToOne(() => StoreEntity, store => store.orders)
      store: StoreEntity
  
      @ManyToOne(() => UsersEntity, (user) => user.orders, { onDelete: 'CASCADE' })
      user: UsersEntity;
  
      @OneToMany(() => OrderedProductsEntity, (orderedProducts) => orderedProducts.order, { 
        cascade: true,
        eager: false
      })
      ordered_products: OrderedProductsEntity[];
  }