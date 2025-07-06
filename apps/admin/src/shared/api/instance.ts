import axios from "axios";
import { requestTokenMiddleware } from "@shared/lib/middlewares/requestAccessTokenMiddleWare";

const API = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_HOST,
})

API.interceptors.request.use(requestTokenMiddleware)

export { API }
