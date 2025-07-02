import { 
    Column, 
    CreateDateColumn, 
    Entity, 
    ManyToOne, 
    OneToMany, 
    PrimaryGeneratedColumn, 
    UpdateDateColumn,
    Index, 
    JoinColumn
  } from "typeorm";
import { UsersEntity } from "./users.entity";
import { OrderedProductsEntity } from "./ordered-products.entity";
import { DeliveryTime } from "./delivery-time.entity";
import { OrderStatusEnum } from "../enums/order-status-enum";
import { StoreEntity } from "./store.entity";
import { DeliveryArea } from "./delivery-area.entity";
import { PickupPointEntity } from "./pickup-point.entity";
import { StoreDeliveryStrategy } from "./store-delivery-strategy.entity";
import { DeliveryStrategyEnum } from "../enums/delivery-strategy.enum";
  
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
  
      @Column({ type: 'date', nullable: true, default: null })
      @Index()
      deliveryDate: Date;

      @Column({
        type: 'enum',
        enum: DeliveryStrategyEnum,
        default: DeliveryStrategyEnum.DeliveryToEntrance
      })
      orderDeliveryStrategy: DeliveryStrategyEnum
  
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
  
      @ManyToOne(() => DeliveryArea, deliveryArea => deliveryArea.orders, { onDelete: 'SET NULL' })
      deliveryArea: DeliveryArea;

      @ManyToOne(() => PickupPointEntity, pickupPoint => pickupPoint.orders, { onDelete: 'SET NULL' })
      @JoinColumn({ name: 'pickup_point_id' })
      pickupPoint: PickupPointEntity;
  
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