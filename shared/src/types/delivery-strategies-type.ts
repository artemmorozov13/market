import { DeliveryStrategyEnum } from "../enums/delivery-strategy.enum";

export interface DeliveryStrategy {
  id: number;
  type: DeliveryStrategyEnum;
  title: string;
}

export interface StoreDeliveryStrategy {
  id: number;
  strategy: DeliveryStrategy;
}

export type StoreDeliveryStrategies = StoreDeliveryStrategy[];