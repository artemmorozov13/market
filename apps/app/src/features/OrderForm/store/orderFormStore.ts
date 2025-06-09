import { makeAutoObservable } from "mobx"
import { fetchAddressListData } from "../api/fetchAddressListData"
import { AddressType } from "@/features/AddNewAddressModal/types/addressesTypes"
import { OrderFormInputs } from "../types/orderFormTypes"

class OrderFormStore {
    addressesList: AddressType[] = []
    complitedForm: OrderFormInputs | null = null

    constructor() {
        makeAutoObservable(this)
    }

    setComplitedForm = (data: OrderFormInputs) => {
        this.complitedForm = data
    }

    fetchAddressesList = async () => {
        try {
            const addresses = await fetchAddressListData()
            this.addressesList = addresses
        } catch {
            
        }
    }
}

export const orderFormStore = new OrderFormStore()
