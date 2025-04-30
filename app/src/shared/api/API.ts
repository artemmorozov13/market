import axios from "axios"
import Cookies from "js-cookie"
import { ACCESS_TOKEN } from "../consts/applicationConsts"
import WebApp from "@twa-dev/sdk"

export const API = axios.create({
    baseURL: process.env.VITE_BACKEND_HOST,
    headers: {
        authorization: `Bearer ${Cookies.get(ACCESS_TOKEN)}`,
        ["init-data"]: "query_id=AAEtt8RoAAAAAC23xGhJ8ePq&user=%7B%22id%22%3A1757722413%2C%22first_name%22%3A%22%D0%90%D1%80%D1%82%D1%91%D0%BC%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22morozov4%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F_rDZfRTHKorzqIPlv0JLWGw3NqviMc6n-V-A4CkDZQ8.svg%22%7D&auth_date=1745931900&signature=GJqtJieShi_fAK-woPKRpuXzqZrSlzj7jy-e8_Ww4JjSITJXbXEU-TpgqcqhkVcQnFolycSM8UAlsUiuYCyJCQ&hash=bd1ebf93525edeffcdf57941cad5c5f5c17e81fa0d34dbb9b75f68fe5991023a"
    }
})

API.interceptors.request.use((config) => {
    const token = Cookies.get(ACCESS_TOKEN);
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }
    return config;
});
