import { makeAutoObservable } from "mobx"
import { fetchAddressListData } from "../api/fetchAddressListData"
import { OrderFormInputs } from "../types/orderFormTypes"
import { AddressType } from "../../AddNewAddressModal/types/addressesTypes"

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
