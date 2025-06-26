import { BasketBaseType } from "@core/types/basket-tipe";
import { StoreBaseType } from "@core/types/store-type";

export interface GroupedBasketItem {
  store: StoreBaseType;
  items: BasketBaseType[];
  storeTotalItems: number;
  storeTotalPrice: number;
  storeDeliveryCost: number;
}

export interface BasketSummary {
  totalItems: number;
  totalStores: number;
  totalPrice: number;
  totalDiscount: number;
  totalDelivery: number;
}

// Группировка товаров по магазинам
export const groupBasketData = (basket?: BasketBaseType[]): Record<number, GroupedBasketItem> => {
  if (!basket) return {};
  
  return basket.reduce((acc, item) => {
    const storeId = item.store.id;
    
    if (!acc[storeId]) {
      acc[storeId] = {
        store: item.store,
        items: [],
        storeTotalItems: 0,
        storeTotalPrice: 0,
        storeDeliveryCost: 0
      };
    }
    
    acc[storeId].items.push(item);
    return acc;
  }, {} as Record<number, GroupedBasketItem>);
};

// Расчеты для каждого магазина
export const calculateStoreStats = (groupedBasket: Record<number, GroupedBasketItem>) => {
  return Object.entries(groupedBasket).reduce((acc, [storeId, storeGroup]) => {
    const storeTotalItems = storeGroup.items.reduce((sum, item) => sum + item.quantity, 0);
    const storeTotalPrice = calculateItemsTotalPrice(storeGroup.items);
    const storeDeliveryCost = calculateDeliveryCost(storeTotalPrice, storeGroup.store);

    acc[Number(storeId)] = {
      ...storeGroup,
      storeTotalItems,
      storeTotalPrice,
      storeDeliveryCost
    };

    return acc;
  }, {} as Record<number, GroupedBasketItem>);
};

// Расчет общей стоимости товаров
export const calculateItemsTotalPrice = (items: BasketBaseType[]) => {
  return items.reduce((sum, item) => {
    const price = item.product.offeredPrice 
      ? Number(item.product.offeredPrice) 
      : Number(item.product.price);
    return sum + (price * item.quantity);
  }, 0);
};

// Расчет стоимости доставки для магазина
export const calculateDeliveryCost = (
  storeTotalPrice: number, 
  store: StoreBaseType
) => {
  return storeTotalPrice >= Number(store.deliveryFreeFromLimit) 
    ? 0 
    : Number(store.deliveryCost);
};

// Расчет общей скидки
export const calculateTotalDiscount = (basket?: BasketBaseType[]) => {
  if (!basket) return 0;
  
  return basket.reduce((acc, item) => {
    const discount = Number(item.product.discount);
    const price = item.product.offeredPrice 
      ? Number(item.product.offeredPrice) 
      : Number(item.product.price);
    return discount > 0
      ? acc + (price * item.quantity * (discount / 100))
      : acc;
  }, 0);
};

// Расчет итоговой статистики корзины
export const calculateBasketSummary = (
  basket: BasketBaseType[] | undefined,
  groupedBasket: Record<number, GroupedBasketItem>
): BasketSummary => {
  const totalItems = basket?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const totalStores = Object.keys(groupedBasket).length;
  const totalPrice = basket ? calculateItemsTotalPrice(basket) : 0;
  const totalDiscount = calculateTotalDiscount(basket);
  
  const totalDelivery = Object.values(groupedBasket).reduce(
    (acc, storeGroup) => acc + storeGroup.storeDeliveryCost, 
    0
  );

  return {
    totalItems,
    totalStores,
    totalPrice,
    totalDiscount,
    totalDelivery
  };
};