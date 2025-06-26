import { makeAutoObservable } from "mobx";
import { UserStore, userStore } from "@/entities/User";
import { Roles } from "@core/enums/role-enum";
import { BasketBaseType } from "@core/types/basket-tipe";

class BasketStore {
    basketList: BasketBaseType[] = [];
    totalPrice: number = 0;
    totalItems: number = 0;
    
    constructor(private userStore: UserStore) {
        makeAutoObservable(this);
    }

    private updateBasketStats() {
        this.totalItems = this.basketList.reduce((sum, item) => sum + item.quantity, 0);
        this.totalPrice = this.basketList.reduce((total, item) => {
            const basePrice = Number(item.product.price) * item.quantity;
            const discountMultiplier = (100 - Number(item.product.discount)) / 100;
            return total + Math.ceil(basePrice * discountMultiplier);
        }, 0);
    }

    clearBasket = () => {
        this.basketList = [];
        this.updateBasketStats();
    };

    fetchBasketList = async () => {
        
    };

    increaseProductCount = async (basketProductId: number) => {
        
    };

    decreaseProductCount = async (basketProductId: number) => {
        
    };

    clearProduct = async (basketProductId: number) => {
        
    }

    addItem = async (item: BasketBaseType) => {
        
    };

    removeItem = async (id: number) => {
        
    };
}

export const basketStore = new BasketStore(userStore);
