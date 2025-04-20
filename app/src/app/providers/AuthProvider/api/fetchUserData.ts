import { basketStore } from "@/entities/Basket"
import { userStore } from "@/entities/User"
import { AuthViaTelegramResponse } from "@/entities/User/types/userTypes"
import { API } from "@/shared/api/API"
import { ACCESS_TOKEN } from "@/shared/consts/applicationConsts"
import { useQuery } from "@tanstack/react-query"
import Cookies from "js-cookie"

export const fetchUserData = async () => {
    const response = await API.post("/users/login", { initData: "query_id=AAEtt8RoAAAAAC23xGjKp0gE&user=%7B%22id%22%3A1757722413%2C%22first_name%22%3A%22%D0%90%D1%80%D1%82%D1%91%D0%BC%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22morozov4%22%2C%22language_code%22%3A%22en%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F_rDZfRTHKorzqIPlv0JLWGw3NqviMc6n-V-A4CkDZQ8.svg%22%7D&auth_date=1744116938&signature=Ss1ic2aHyHw9sWElp0iHIZcArBKQHVWQcknmxPvZVt82dI534JgGC0HBJ7Bqpj8NGdcXORnO--tGGNfjEf_vDA&hash=5ea2c701cb53a232364bd32c574c50330a96277498696f9a595aa5f11a6fd266" })

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
