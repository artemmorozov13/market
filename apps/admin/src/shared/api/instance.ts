import axios from "axios";
import Cookies from "js-cookie";
import { ACCESS_TOKEN } from "../lib/consts/consts";
import { requestTokenMiddleware } from "@shared/lib/middlewares/requestAccessTokenMiddleWare";

const API = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_HOST,
    headers: {
        Authorization: `Bearer ${Cookies.get(ACCESS_TOKEN)}`
    }
})

API.interceptors.request.use(requestTokenMiddleware)

export { API }
