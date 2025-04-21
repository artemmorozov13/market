import { basketStore } from "@/entities/Basket"
import { userStore } from "@/entities/User"
import { AuthViaTelegramResponse } from "@/entities/User/types/userTypes"
import { API } from "@/shared/api/API"
import { ACCESS_TOKEN } from "@/shared/consts/applicationConsts"
import { useQuery } from "@tanstack/react-query"
import WebApp from "@twa-dev/sdk"
import Cookies from "js-cookie"

export const fetchUserData = async () => {
    const response = await API.post("/users/login", { initData: WebApp.initData })

    const { setUserData } = userStore
    const { fetchBasketList } = basketStore

    await fetchBasketList()
    setUserData(response.data)
    Cookies.set(ACCESS_TOKEN, response.data.token)
    return response.data
}

export const useUser = () => {
    const query = useQuery<AuthViaTelegramResponse>({
        queryKey: ["user"],
        queryFn: () => fetchUserData()
    })
    return {
        ...query,
        user: query.data
    }
}
