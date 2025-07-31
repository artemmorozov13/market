import { API } from "@/shared/api/API"
import { AuthViaTelegramResponse } from "../types/userTypes";
import { userStore } from "../store/userStore";
import { basketStore } from "@/entities/Basket";
import Cookies from "js-cookie";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/shared/consts/applicationConsts";
import { accessCookiesOptions, refreshCookiesOptions } from "@core/consts/token-settings";
import { Roles } from "@core/enums/role-enum";
import { useMutation } from "@tanstack/react-query";

const createAnonimousUser = async () => {
    const response = await API.post<AuthViaTelegramResponse>('/users/create');
    const { setUserData, setUserRole } = userStore;
    const { fetchBasketList } = basketStore;

    Cookies.set(ACCESS_TOKEN, response.data.token, accessCookiesOptions);
    Cookies.set(REFRESH_TOKEN, response.data.refreshToken, refreshCookiesOptions);
    setUserData(response.data);
    setUserRole(Roles.User);

    await fetchBasketList();
    return response.data.user;
}

export const useCreateUser = () => {
    const mutation = useMutation({
        mutationFn: createAnonimousUser
    })

    return {
        ...mutation,
        createAnonimousUser: mutation.mutateAsync
    }
}