import axios from "axios"
import Cookies from "js-cookie"
import { ACCESS_TOKEN } from "../consts/applicationConsts"

export const API = axios.create({
    baseURL: process.env.VITE_BACKEND_HOST,
    headers: {
        authorization: `Bearer ${Cookies.get(ACCESS_TOKEN)}`,
    }
})

API.interceptors.request.use((config) => {
    const token = Cookies.get(ACCESS_TOKEN);
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }
    return config;
});
