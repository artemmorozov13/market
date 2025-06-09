import { makeAutoObservable } from "mobx";
import { BasketType } from "..";
import { clearBasketProduct, fetchBasketListData, pushBasketItem, removeBasketItem } from "../api/fetchBasketListData";
import { UserStore, userStore } from "@/entities/User";

class BasketStore {
    basketList: BasketType[] = [];
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
        if (this.userStore.role === 'customer') {
            try {
                const basketItems = await fetchBasketListData();
                this.basketList = basketItems;
                this.updateBasketStats();
            } catch (error) {
                console.error("Failed to fetch basket list:", error);
                throw error;
            }
        }
    };

    increaseProductCount = async (basketProductId: number) => {
        try {
            const currentItem = this.basketList.find(basketItem => basketItem.productId === basketProductId);

            if (this.userStore.role === 'customer') {
                await pushBasketItem(basketProductId);
            }

            if (currentItem) {
                currentItem.quantity += 1;
                this.updateBasketStats();
            }
        } catch (error) {
            console.error("Failed to increase product count:", error);
        }
    };

    decreaseProductCount = async (basketProductId: number) => {
        try {
            const currentItem = this.basketList.find(basketItem => basketItem.productId === basketProductId);

            if (this.userStore.role === 'customer') {
                await removeBasketItem(basketProductId);
            }

            if (currentItem) {
                if (currentItem.quantity > 1) {
                    currentItem.quantity -= 1;
                } else {
                    this.basketList = this.basketList.filter(item => item.productId !== basketProductId);
                }
                this.updateBasketStats();
            }
        } catch (error) {
            console.error("Failed to decrease product count:", error);
        }
    };

    clearProduct = async (basketProductId: number) => {
        try {
            const currentItem = this.basketList.find(basketItem => basketItem.productId === basketProductId);

            if (this.userStore.role === 'customer') {
                await clearBasketProduct(basketProductId)
            }
            
            if (currentItem) {
                this.basketList = this.basketList.filter(item => item.productId !== basketProductId);
                this.updateBasketStats();
            }
        } catch (error) {
            console.error("Failed to decrease product count:", error);
        }
    }

    addItem = async (item: BasketType) => {
        try {
            if (this.userStore.role === 'customer') {
                await pushBasketItem(item.productId);
            }

            this.basketList.push(item);
            this.updateBasketStats();
        } catch (error) {
            console.error("Failed to add item:", error);
        }
    };

    removeItem = async (id: number) => {
        try {
            if (this.userStore.role === 'customer') {
                await removeBasketItem(id);
            }

            this.basketList = this.basketList.filter(item => item.productId !== id);
            this.updateBasketStats();
        } catch (error) {
            console.error("Failed to remove item:", error);
        }
    };
}

export const basketStore = new BasketStore(userStore);
