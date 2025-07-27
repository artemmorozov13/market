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
    initData?: TelegramAuthData | null
    onSuccess?: () => void
}

const fetchUserData = async (options?: FetchUserDataOptions) => {
  try {
    const accessToken = Cookies.get(ACCESS_TOKEN);
    const refreshToken = Cookies.get(REFRESH_TOKEN)

    const urlParams = new URLSearchParams(window.location.search);
    const tgWebAppStartParam = urlParams.get("tgWebAppStartParam");
    const storeId = tgWebAppStartParam?.split('_')[1];

    if (window.Telegram?.WebApp.initData) {
      const response = await API.post<AuthViaTelegramResponse>("/users/login", {
        initData: window.Telegram?.WebApp.initData,
        storeId: storeId
      });

      const { setUserData, setUserRole } = userStore;
      const { fetchBasketList } = basketStore;

      Cookies.set(ACCESS_TOKEN, response.data.token, accessCookiesOptions);
      setUserData(response.data);
      setUserRole(Roles.User);

      await fetchBasketList();
      return response.data.user;
    }

    if (options?.initData) {
      const response = await API.post<AuthViaTelegramResponse>("/auth/login-telegram", {
        initData: options?.initData,
        storeId: storeId,
      });

      const { setUserData, setUserRole } = userStore;
      const { fetchBasketList } = basketStore;

      Cookies.set(ACCESS_TOKEN, response.data.token, accessCookiesOptions);
      Cookies.set(REFRESH_TOKEN, response.data.refreshToken, refreshCookiesOptions);
      setUserData(response.data);
      setUserRole(Roles.User);

      await fetchBasketList();
      return response.data.user;
    }

    if (!options?.initData) {
      const response = await API.post<AuthViaTelegramResponse>("/users/login", {
        storeId: storeId,
      });

      const { setUserData, setUserRole } = userStore;
      const { fetchBasketList } = basketStore;

      Cookies.set(ACCESS_TOKEN, response.data.token, accessCookiesOptions);
      Cookies.set(REFRESH_TOKEN, response.data.refreshToken, refreshCookiesOptions);
      setUserData(response.data);
      setUserRole(Roles.User);

      await fetchBasketList();
      return response.data.user;
    }

    if (accessToken || refreshToken) {
      const response = await API.get<UserType>("/users");
      const { setUserRole } = userStore;
      const { fetchBasketList } = basketStore;

      setUserRole(Roles.User);

      await fetchBasketList();
      return response.data;
    }

    options?.onSuccess?.();
    return null;
  } catch (error) {
    throw error;
  }
}

export const useUser = (options?: FetchUserDataOptions) => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ["user", options?.initData],
    queryFn: () => {
        const response = fetchUserData(options)
        queryClient.invalidateQueries({ queryKey: ['delivery-times'] });
        return response
    },
  });

  return {
    ...query,
    user: query.data,
    refetchUser: query.refetch
  };
};
