import { NavigateFunction } from "react-router-dom"
import { AuthFormSchema } from "../types/formTypes"
import Cookies from "js-cookie"
import { accessCookiesOptions, refreshCookiesOptions } from "@core/consts/token-settings";
import { UserLoginResponse, userStore } from "@entities/User"
import { api } from "@shared/api/notAuthInstance"
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@shared/lib/consts/consts"

export interface PostUserAuthOptions {
    body: AuthFormSchema
    navigate: NavigateFunction
}

export const postUserAuth = async (options: PostUserAuthOptions) => {
    const { body } = options

    try {
        const response = await api.post<UserLoginResponse>("/auth/login", body)

        const { setUserData } = userStore

        if (response.data) {
            Cookies.set(ACCESS_TOKEN, response.data.token, accessCookiesOptions)
            Cookies.set(REFRESH_TOKEN, response.data.refreshToken, refreshCookiesOptions)
            setUserData(response.data.user)
        }

        window.location.replace('/admin/')

        return response.data
    } catch {
        throw new Error()
    }
}