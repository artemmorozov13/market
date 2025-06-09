import { SelectOptionType } from "@/shared/ui/Select/types";

export interface AddressType {
    id: number
    region: SelectOptionType<number> | null;
    street: SelectOptionType<number> | null;
    house: string;
    entrance: string;
    floor: string;
    apartment: string;
    intercom: string;
}

export interface AddressFormSchema {
    fullAddress: string,
    entrance: string,
    floor: string,
    apartment: string,
    intercom: string,
    addressData: {
        postal_code: string,
        fias_id: string,
        geo_lat: string,
        geo_lon: string,
    }
}
