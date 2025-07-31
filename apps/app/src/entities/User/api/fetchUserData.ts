// useUser.ts
import { basketStore } from "@/entities/Basket"
import { userStore } from "@/entities/User"
import { AuthViaTelegramResponse } from "@/entities/User/types/userTypes"
import { API } from "@/shared/api/API"
import { ACCESS_TOKEN, LOCALSTORAGE_STOREID_KEY, REFRESH_TOKEN } from "@/shared/consts/applicationConsts"
import { Roles } from "@core/enums/role-enum"
import { UserType } from "@core/types/user-type"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { TelegramAuthData } from "@telegram-auth/react"
import Cookies from "js-cookie"
import { accessCookiesOptions, refreshCookiesOptions } from "@core/consts/token-settings"

interface FetchUserDataOptions {
    storeId?: string | number | null
    onSuccess?: () => void
    enabled?: boolean
}

const fetchUserData = async (options?: FetchUserDataOptions) => {
  const refreshToken = Cookies.get(REFRESH_TOKEN)

  if (refreshToken) {
    const response = await API.post<AuthViaTelegramResponse>("/users/login", {
      storeId: options?.storeId
    });

    const { setUserData, setUserRole } = userStore;
    const { fetchBasketList } = basketStore;

    Cookies.set(ACCESS_TOKEN, response.data.token, accessCookiesOptions);
    setUserData(response.data);
    setUserRole(Roles.User);

    await fetchBasketList();
    return response.data.user;
  }
}

export const useUser = (options?: FetchUserDataOptions) => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ["user"],
    queryFn: () => {
        const response = fetchUserData(options)
        queryClient.invalidateQueries({ queryKey: ['delivery-times'] });
        return response
    },
    enabled: !!options?.enabled
  });

  return {
    ...query,
    user: query.data,
    refetchUser: query.refetch
  };
};
