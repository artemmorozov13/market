
import { AddressType } from "@core/types/address-type";
import { calculateDistance } from "./calculateDistance";
import { DEFAULT_STATIC_PICKUP_POINT_NAME } from "../consts/applicationConsts";
import { PickupPointBase } from "@core/types/pickup-point";

export const findNearestPickupPoint = (address: AddressType, points: PickupPointBase[]) => {
    if (!address || !points?.length) return null;

    const pointsWithCoords = points.filter(point => point.geo_lat && point.geo_lon);
    if (!pointsWithCoords.length) return null;

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

    const availablePoints = pointsWithDistance.filter(
      point => point.distance < point.radius / 1000
    );

    const nearestPoint = [...availablePoints].sort((a, b) => a.distance - b.distance)[0];
    if (nearestPoint) return nearestPoint;

    return pointsWithDistance.find(
      point => point.name === DEFAULT_STATIC_PICKUP_POINT_NAME
    ) || null;
  };