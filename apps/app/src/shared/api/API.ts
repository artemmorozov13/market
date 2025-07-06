import axios from "axios"
import { requestTokenMidleware } from "../middlware/requestRefreshTokenMiddleware";

export const API = axios.create({
    baseURL: process.env.VITE_BACKEND_HOST,
})

API.interceptors.request.use(requestTokenMidleware);
