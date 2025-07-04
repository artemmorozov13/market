import { NavigateFunction } from "react-router-dom"
import { RegisterFormSchema } from "../types/registrationStateSchema"
import Cookies from "js-cookie"
import { api } from "@shared/api/notAuthInstance"
import { UserLoginResponse, userStore } from "@entities/User"
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@shared/lib/consts/consts"
import { accessCookiesOptions, refreshCookiesOptions } from "@core/consts/token-settings"

export interface PostNewUserOptions {
    body: RegisterFormSchema
    navigate: NavigateFunction
}

export const postNewUser = async (options: PostNewUserOptions) => {
    const { body } = options

    try {
        const postBody = {
            username: body.username,
            password: body.password,
            firstName: body.firstName,
            lastName: body.lastName,
            shopName: body.shopName
        }
        const response = await api.post<UserLoginResponse>("/users/register", postBody)
        const { setUserData } = userStore

        if (response.data) {
            Cookies.set(ACCESS_TOKEN, response.data.token, accessCookiesOptions)
            Cookies.set(REFRESH_TOKEN, response.data.token, refreshCookiesOptions)
            setUserData(response.data.user)
        }

        window.location.replace("/editor/shop")

        return response.data
    } catch {
        throw new Error()
    }
}