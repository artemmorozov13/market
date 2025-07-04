import axios from "axios"
import Cookies from "js-cookie"
import { ACCESS_TOKEN } from "../consts/applicationConsts"
import { requestTokenMidleware } from "../middlware/requestRefreshTokenMiddleware";

export const API = axios.create({
    baseURL: process.env.VITE_BACKEND_HOST,
    headers: {
        authorization: `Bearer ${Cookies.get(ACCESS_TOKEN)}`,
    }
})

API.interceptors.request.use(requestTokenMidleware);
