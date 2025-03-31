import axios from "axios";
import Cookies from "js-cookie";
import { ACCESS_TOKEN } from "../lib/consts/consts";

const accessToken = Cookies.get(ACCESS_TOKEN)

const API = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_HOST,
    headers: {
        Authorization: `Bearer ${accessToken}`
    }
})

// API.interceptors.request.use(requestTokenMiddleware)

export { API }
