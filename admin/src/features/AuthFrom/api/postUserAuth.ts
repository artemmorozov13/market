import { NavigateFunction } from "react-router-dom"
import { AuthFormSchema } from "../types/formTypes"
import Cookies from "js-cookie"
import { routeConfig } from "@shared/lib/consts/routeConfig"
import { UserLoginResponse, userStore } from "@entities/User"
import { api } from "@shared/api/notAuthInstance"
import { ACCESS_TOKEN, ACCESS_TOKEN_EXPIRE, REFRESH_TOKEN, REFRESH_TOKEN_EXPIRE } from "@shared/lib/consts/consts"

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
            Cookies.set(ACCESS_TOKEN, response.data.token, { expires: ACCESS_TOKEN_EXPIRE })
            Cookies.set(REFRESH_TOKEN, response.data.refreshToken, { expires: REFRESH_TOKEN_EXPIRE })
            setUserData(response.data.user)
        }

        window.location.replace(routeConfig.product)

        return response.data
    } catch {
        throw new Error()
    }
}