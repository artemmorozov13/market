import { API } from "@/shared/api/API";
import { useMutation } from "@tanstack/react-query"
import { TelegramAuthData } from "@telegram-auth/react";


export const postTelegramIntegrate = async (body: TelegramAuthData) => {
    const response = await API.post('/users/telegram-connect', body)
    return response.data
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