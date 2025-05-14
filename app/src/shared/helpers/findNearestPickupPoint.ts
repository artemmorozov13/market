import { AddressType } from "@/entities/Addresses";
import { calculateDistance } from "./calculateDistance";
import { PickupPoint } from "@/features/OrderForm/types/orderFormTypes";

export const findNearestPickupPoint = (
    address: AddressType,
    pickupPoints: PickupPoint[]
  ): PickupPoint | null => {
    const pointsWithCoords = pickupPoints.filter(
      point => point.geo_lat && point.geo_lon
    );
    
    if (pointsWithCoords.length === 0) return null;
    
    const addressLat = parseFloat(address.geo_lat);
    const addressLon = parseFloat(address.geo_lon);
    
    const pointsWithDistance = pointsWithCoords.map(point => ({
      ...point,
      distance: calculateDistance(
        addressLat,
        addressLon,
        parseFloat(point.geo_lat),
        parseFloat(point.geo_lon)
      )
    }));
    
    return pointsWithDistance.sort((a, b) => a.distance - b.distance)[0];
};