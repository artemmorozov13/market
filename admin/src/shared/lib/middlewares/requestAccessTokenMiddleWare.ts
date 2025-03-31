import axios, { InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../consts/consts";


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

  const body = {
    refreshToken: Cookies.get(REFRESH_TOKEN)
  };

  if (!accessToken) {
    isRefreshing = true;

    const response = await axios.post(
      `http://localhost:3000/users/refresh`,
      body,
    );
    const access = response.data.accessToken;
    const refresh = response.data.refreshToken;

    setAccessToken(access);
    setRefreshToken(refresh)

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

const setAccessToken = (token: string) => {
    const options: any = {
      expires: 1234,
      secure: true,
    };
    Cookies.set(ACCESS_TOKEN, token, options);
};

const setRefreshToken = (token: string) => {
  const options: any = {
    expires: 1234,
    secure: true,
  };
  Cookies.set(REFRESH_TOKEN, token, options);
};
