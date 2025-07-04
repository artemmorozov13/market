import { WeekdayEnum } from "@core/enums/weekday.enum";

export interface PickupPointWorkingHours {
    dayOfWeek: WeekdayEnum;
    openingTime: string;
    closingTime: string;
}

export interface PickupPointFormData {
    id?: number;
    name: string;
    fullAddress: string;
    postal_code?: string;
    fias_id?: string;
    geo_lat?: string;
    geo_lon?: string;
    status?: 'active' | 'deleted';
    workingHours: PickupPointWorkingHours[];
}

export interface PickupPoint extends Omit<PickupPointFormData, 'id'> {
    id: number;
    createdAt?: Date;
    updatedAt?: Date;
}