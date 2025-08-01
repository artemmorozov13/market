import { API } from "@/shared/api/API";
import { useMutation } from "@tanstack/react-query"
import { TelegramAuthData } from "@telegram-auth/react";
import { userStore } from "../store/userStore";
import { basketStore } from "@/entities/Basket";
import Cookies from "js-cookie";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/shared/consts/applicationConsts";
import { accessCookiesOptions, refreshCookiesOptions } from "@core/consts/token-settings";
import { Roles } from "@core/enums/role-enum";


export const postTelegramIntegrate = async (body: TelegramAuthData) => {
    const response = await API.post('/users/telegram-connect', body)

    const { setUserData, setUserRole } = userStore;
    const { fetchBasketList } = basketStore;

    Cookies.set(ACCESS_TOKEN, response.data.token, accessCookiesOptions);
    Cookies.set(REFRESH_TOKEN, response.data.refreshToken, refreshCookiesOptions);
    setUserData(response.data);
    setUserRole(Roles.User);

    await fetchBasketList();
    
    return response.data.user;
}

export const useTelegramIntegrate = () => {
    const mutation = useMutation({
        mutationFn: (body: TelegramAuthData) => postTelegramIntegrate(body)
    });

    return {
        ...mutation,
        authViaTelegram: mutation.mutateAsync
    }
}