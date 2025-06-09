import { basketStore } from "@/entities/Basket"
import { userStore } from "@/entities/User"
import { AuthViaTelegramResponse } from "@/entities/User/types/userTypes"
import { API } from "@/shared/api/API"
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/shared/consts/applicationConsts"
import { useQuery } from "@tanstack/react-query"
import { TelegramAuthData } from "@telegram-auth/react"
import Cookies from "js-cookie"

interface FetchUserDataOptions {
    initData?: TelegramAuthData | null
    onSuccess?: () => void
}

export const fetchUserData = async (options?: FetchUserDataOptions) => {
   try {
    const accessToken = Cookies.get(ACCESS_TOKEN);
    const refreshToken = Cookies.get(REFRESH_TOKEN)

    if (window?.Telegram?.WebApp?.initData) {
        const response = await API.post("/users/login", { initData: window?.Telegram?.WebApp?.initData })
        const { setUserData, setUserRole } = userStore
        const { fetchBasketList } = basketStore

        Cookies.set(ACCESS_TOKEN, response.data.token, { expires: 1 })
        setUserData(response.data)
        setUserRole('customer')

        await fetchBasketList()
        return response.data
    }

    if (options?.initData) {
        const response = await API.post("/auth/login-telegram", { initData: options?.initData })
        const { setUserData, setUserRole } = userStore
        const { fetchBasketList } = basketStore

        Cookies.set(ACCESS_TOKEN, response.data.token, { expires: 1 })
        Cookies.set(REFRESH_TOKEN, response.data.refreshToken, { expires: 30 })
        setUserData(response.data)
        setUserRole('customer')

        await fetchBasketList()
        return response.data
    }

    if (accessToken || refreshToken) {
        const response = await API.get("/users")

        const { setUserData, setUserRole } = userStore
        const { fetchBasketList } = basketStore

        setUserData(response.data)
        setUserRole('customer')

        await fetchBasketList()

        return {
            user: response.data
        }
    }
    options?.onSuccess?.()
   } catch (error) {
    throw error
   }
}

export const useUser = (options?: FetchUserDataOptions) => {
    const query = useQuery<AuthViaTelegramResponse>({
        queryKey: ["user", options?.initData],
        queryFn: () => fetchUserData(options),
    })
    return {
        ...query,
        user: query.data
    }
}
