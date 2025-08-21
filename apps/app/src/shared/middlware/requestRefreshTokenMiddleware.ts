import axios, { InternalAxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../consts/applicationConsts'
import { accessCookiesOptions } from '@core/consts/token-settings'

let isRefreshing = false
const timedoutRequestsQueue: [NodeJS.Timeout, (value: unknown) => void][] = []
const TIMEOUT_REQUEST = 30000

export const requestTokenMidleware = async (config: InternalAxiosRequestConfig) => {
  const accessToken = Cookies.get(ACCESS_TOKEN)
  const refreshToken = Cookies.get(REFRESH_TOKEN)

  if (isRefreshing) {
    await new Promise((resolve) => {
      const timeout = setTimeout(resolve, TIMEOUT_REQUEST)
      timedoutRequestsQueue.push([timeout, resolve])
    })

    const accessToken = Cookies.get(ACCESS_TOKEN)

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  }

  if (!accessToken && refreshToken) {
    isRefreshing = true

    const response = await axios.post(
      `/api/auth/refresh`,
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      },
    )

    Cookies.set(ACCESS_TOKEN, response.data.token, accessCookiesOptions)

    for (let i = 0; i < timedoutRequestsQueue.length; i++) {
      const [timeout, resolver] = timedoutRequestsQueue[i]
      clearTimeout(timeout)
      resolver(true)
    }
    timedoutRequestsQueue.length = 0
    isRefreshing = false
  }

  const accessKey = Cookies.get(ACCESS_TOKEN)

  if (accessKey) {
    config.headers.Authorization = `Bearer ${accessKey}`
  }

  return config
}
