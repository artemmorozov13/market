import { userStore } from ".."
import Cookies from "js-cookie"
import { CustomerUserType, UserLoginResponse } from "../types/userTypes"
import { API } from "@shared/api/instance"
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@shared/lib/consts/consts"

export interface FetchAuthByTelegramOptions {
    user: CustomerUserType
    storeId: string
}

export const fetchAuthByTelegram = async (options: FetchAuthByTelegramOptions) => {
    const { user, storeId } = options

    try {
        const { setUserData } = userStore
        const response = await API.post<UserLoginResponse>("/users/auth/telegram", user)

        if (!response.data) {
            throw new Error()
        }

        setUserData(response.data.user)
        Cookies.set(REFRESH_TOKEN, response.data.token)
        Cookies.set(ACCESS_TOKEN, response.data.token)

        // window.location.replace(RoutePath.registration.replace(":storeId", storeId))

        return response.data.user
    } catch {
        throw new Error()
    }
}