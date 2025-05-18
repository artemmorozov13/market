import { basketStore } from "@/entities/Basket"
import { userStore } from "@/entities/User"
import { AuthViaTelegramResponse } from "@/entities/User/types/userTypes"
import { API } from "@/shared/api/API"
import { ACCESS_TOKEN } from "@/shared/consts/applicationConsts"
import { useQuery } from "@tanstack/react-query"
import WebApp from "@twa-dev/sdk"
import Cookies from "js-cookie"

interface UseUserOptions {
    initData?: string
}

export const fetchUserData = async (options?: UseUserOptions) => {
   if (WebApp.initData || options?.initData) {
    const response = await API.post("/users/login", { initData: WebApp.initData || options?.initData })

    const { setUserData, setUserRole } = userStore
    const { fetchBasketList } = basketStore

    Cookies.set(ACCESS_TOKEN, response.data.token, { expires: 0.5 })
    setUserData(response.data)
    setUserRole('customer')

    await fetchBasketList()

    return response.data
   }
}

export const useUser = (options?: UseUserOptions) => {
    const query = useQuery<AuthViaTelegramResponse>({
        queryKey: ["user"],
        queryFn: () => fetchUserData(options)
    })
    return {
        ...query,
        user: query.data
    }
}
