import { DeliveryTimeIntervalBase } from "./delivery-time";

export type DeliveryAreaBase = {
  id: number;
  name: string;
  radius: number;
  fullAddress: string;
  postal_code: string;
  fias_id: string;
  geo_lat: string;
  geo_lon: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  deliveryTimes?: DeliveryTimeIntervalBase[];
};