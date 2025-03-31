import { makeAutoObservable } from "mobx";
import { IPromiseBasedObservable, fromPromise } from "mobx-utils";
import { StoreType } from "..";
import { fetchStore } from "../api/fetchStore";

class StoreStorage {
    store: IPromiseBasedObservable<StoreType> | null = null;

    constructor () {
        makeAutoObservable(this)
    }

    fetchStoreData = () => {
        this.store = fromPromise(fetchStore())
    }
}

export const storeStorage = new StoreStorage()
