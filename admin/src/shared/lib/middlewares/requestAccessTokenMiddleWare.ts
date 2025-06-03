import axios, { InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { ACCESS_TOKEN, ACCESS_TOKEN_EXPIRE, REFRESH_TOKEN } from "../consts/consts";


let isRefreshing = false;
const timedoutRequestsQueue: [NodeJS.Timeout, (value: unknown) => void][] = [];
const TIMEOUT_REQUEST = 30000;

export const requestTokenMiddleware: any = async (
  config: InternalAxiosRequestConfig,
) => {
  const accessToken = Cookies.get(ACCESS_TOKEN);

  if (isRefreshing) {
    await new Promise((resolve) => {
      const timeout = setTimeout(resolve, TIMEOUT_REQUEST);
      timedoutRequestsQueue.push([timeout, resolve]);
    });

    const accessToken = Cookies.get(ACCESS_TOKEN);
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  }

  const refreshToken = Cookies.get(REFRESH_TOKEN)

  if (!accessToken) {
    isRefreshing = true;

    const response = await axios.post(
      `/api/auth/refresh`,
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`
        }
      }
    );
    const access = response.data.token;

    Cookies.set(ACCESS_TOKEN, access, { expires: ACCESS_TOKEN_EXPIRE })

    if (timedoutRequestsQueue.length > 0) {
      for (let i = 0; i < timedoutRequestsQueue.length; i++) {
        const [timeout, resolver] = timedoutRequestsQueue[i];
        clearTimeout(timeout);
        resolver(true);
      }
      timedoutRequestsQueue.length = 0;
    }
    isRefreshing = false;
  }

  const token = Cookies.get(ACCESS_TOKEN);
  config.headers["Authorization"] = `Bearer ${token}`;

  return config;
};
