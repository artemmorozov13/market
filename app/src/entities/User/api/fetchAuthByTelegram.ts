import { API } from "@/shared/api/API"
import type { TelegramAuthData } from "@telegram-auth/react"
import { userStore } from ".."
import Cookies from "js-cookie"
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/shared/consts/applicationConsts"
import { AuthViaTelegramResponse } from "../types/userTypes"

export interface FetchAuthByTelegramOptions {
    user: TelegramAuthData
}

export const fetchAuthByTelegram = async (options: FetchAuthByTelegramOptions) => {
    const { user } = options

    try {
        const { setUserData } = userStore
        const response = await API.post<AuthViaTelegramResponse>("/users/auth/telegram", user)

        if (!response.data) {
            throw new Error()
        }

        setUserData(response.data)
        Cookies.set(REFRESH_TOKEN, response.data.token)
        Cookies.set(ACCESS_TOKEN, response.data.token)

        // window.location.replace(RoutePath.registration)

        return response.data.user
    } catch {
        throw new Error()
    }
}