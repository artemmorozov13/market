import { API } from "@/shared/api/API"
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/shared/consts/applicationConsts"
import Cookies from "js-cookie"
import { userStore } from ".."
import { AuthViaTelegramResponse } from "../types/userTypes"

export interface RequestRefreshTokenOptions {
    refreshToken: string
}

const errorMessage = "Ошибка при перезапросе access токена"

export const requestRefreshToken = async (options: RequestRefreshTokenOptions) => {
    const { refreshToken } = options

    try {
        const { setUserData } = userStore
        const response = await API.post<AuthViaTelegramResponse>("/users/refresh", { refreshToken })

        if (!response.data) {
            throw new Error(errorMessage)
        }

        setUserData(response.data)
        Cookies.set(REFRESH_TOKEN, response.data.token)
        Cookies.set(ACCESS_TOKEN, response.data.token)

        return response.data
    } catch {
        throw new Error(errorMessage)
    }
}
