export interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    discount: string;
    image: string;
    unitValue: number;
    unitOfMeasurement: string;
    is_expired: boolean;
}
  
export interface OrderedProduct {
    id: number;
    telegram_id: string;
    quantity: number;
    product: Product;
}
  
export interface PickupPoint {
    id: number;
    name: string;
    fullAddress: string;
    postal_code: string;
    fias_id: string;
    geo_lat: string;
    geo_lon: string;
    status: string;
}
  
export interface Order {
    id: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    deliveryDate: string;
    address: string;
    fullAddress: string;
    phoneNumber: string;
    comment: string;
    totalAmount: string;
    paymentMethod: string | null;
    ordered_products: OrderedProduct[];
    deliveryTime: string | null;
    pickupPoint: PickupPoint;
}