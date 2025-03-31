import { basketStore } from "@/entities/Basket"
import { userStore } from "@/entities/User"
import { API } from "@/shared/api/API"
import { useQuery } from "@tanstack/react-query"

export interface UserQueryOptions {
    initData: string
}

export const fetchUserData = async (options: UserQueryOptions) => {
    const { initData } = options

    const response = await API.post("/users/login", { initData: initData })

    const { setUserData } = userStore
    const { fetchBasketList } = basketStore

    await fetchBasketList()
    setUserData(response.data)
    return response.data
}

export const useUser = (options: UserQueryOptions) => {
    const query = useQuery({
        queryKey: ["user"],
        queryFn: () => fetchUserData(options)
    })
    return query
}
