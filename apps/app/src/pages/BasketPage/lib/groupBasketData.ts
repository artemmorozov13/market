import { BasketBaseType } from "@core/types/basket-tipe";
import { StoreBaseType } from "@core/types/store-type";

interface GroupType {
    store: StoreBaseType;
    items: BasketBaseType[];
}

export const groupBasketData = (basket?: BasketBaseType[]): Record<number, GroupType> => {
    if (!basket) {
        return {} as Record<number, GroupType>;
    }
    
    return basket.reduce((acc, item) => {
        const storeId = item.store.id;
        if (!acc[storeId]) {
            acc[storeId] = {
                store: item.store,
                items: []
            };
        }
        acc[storeId].items.push(item);
        return acc;
    }, {} as Record<number, GroupType>);
};