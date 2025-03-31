import { API } from "@/shared/api/API"
import { AddressFormSchema } from "../types/addressesTypes";

export const putNewAddress = async (address: AddressFormSchema) => {
    try {
        const response = await API.post("/addresses", address);
        return response;
      } catch {
        return true;
      }
}