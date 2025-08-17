import { useMutation } from "@tanstack/react-query"
import { TelegramAuthData } from "@telegram-auth/react";
import Cookies from "js-cookie";
import { accessCookiesOptions, refreshCookiesOptions } from "@core/consts/token-settings";
import { API } from "@shared/api/instance";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@shared/lib/consts/consts";


export const postTelegramIntegrate = async (body: TelegramAuthData) => {
    const response = await API.post('/store-users/telegram-connect', body)

    Cookies.set(ACCESS_TOKEN, response.data.token, accessCookiesOptions);
    Cookies.set(REFRESH_TOKEN, response.data.refreshToken, refreshCookiesOptions);
    
    return response.data.user;
}

export const useTelegramIntegrate = () => {
    const mutation = useMutation({
        mutationFn: (body: TelegramAuthData) => postTelegramIntegrate(body)
    });

    return {
        ...mutation,
        connectTelegram: mutation.mutateAsync
    }
}