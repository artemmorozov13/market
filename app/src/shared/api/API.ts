import axios from "axios"
import Cookies from "js-cookie"
import { ACCESS_TOKEN } from "../consts/applicationConsts"
import WebApp from "@twa-dev/sdk"

console.log(process.env.VITE_BACKEND_HOST)

export const API = axios.create({
    baseURL: process.env.VITE_BACKEND_HOST,
    headers: {
        authorization: `Bearer ${Cookies.get(ACCESS_TOKEN)}`,
        ["init-data"]: WebApp.initData
    }
})