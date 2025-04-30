import { API } from "@shared/api/instance";
import { AxiosRequestConfig } from "axios";
import { OrderType } from "../types/orderTypes";

interface FetchOrdersDataOptions {
    skip?: number
    take?: number
    enabled?: boolean
}

interface OrderResponse {
  items: OrderType[]
  pagination: {
    total: number
    limit: number
    hasMore: boolean
  }
}

export const fetchOrderData = async (options?: FetchOrdersDataOptions) => {
  try {
    const config: AxiosRequestConfig = {
      params: {
        skip: options?.skip,
        limit: options?.take,
      },
    };
    const response = await API.get<OrderResponse>(`/order`, config);
    return response.data;
  } catch (error) {
    console.error("Ошибка при получении заказов:", error);
    throw error;
  }
};
