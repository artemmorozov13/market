import { basketStore } from '@/entities/Basket'
import { userStore } from '@/entities/User'
import { AuthViaTelegramResponse } from '@/entities/User/types/userTypes'
import { API } from '@/shared/api/API'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/shared/consts/applicationConsts'
import { Roles } from '@core/enums/role-enum'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import { accessCookiesOptions, refreshCookiesOptions } from '@core/consts/token-settings'
import { parseTelegramData } from '@/shared/helpers/parseTelegramData'

interface FetchUserDataOptions {
  storeId?: string | number | null
  onSuccess?: () => void
  enabled?: boolean
}

const fetchUserData = async (options?: FetchUserDataOptions) => {
  const refreshToken = Cookies.get(REFRESH_TOKEN)
  const telegramUser = window.Telegram?.WebApp.initData

  if (refreshToken) {
    const response = await API.post<AuthViaTelegramResponse>('/users/login', {
      storeId: options?.storeId,
    })

    const { setUserData, setUserRole } = userStore
    const { fetchBasketList } = basketStore

    Cookies.set(ACCESS_TOKEN, response.data.token, accessCookiesOptions)
    setUserData(response.data)
    setUserRole(Roles.User)

    await fetchBasketList()
    return response.data.user
  }

  if (telegramUser) {
    const telegramData = parseTelegramData(telegramUser)
    const response = await API.post<AuthViaTelegramResponse>('/users/login-telegram', {
      ...telegramData,
      storeId: options?.storeId,
    })

    const { setUserData, setUserRole } = userStore
    const { fetchBasketList } = basketStore

    Cookies.set(ACCESS_TOKEN, response.data.token, accessCookiesOptions)
    setUserData(response.data)
    setUserRole(Roles.User)

    await fetchBasketList()
    return response.data.user
  }
}

export const useUser = (options?: FetchUserDataOptions) => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['user'],
    queryFn: () => {
      const response = fetchUserData(options)
      queryClient.invalidateQueries({ queryKey: ['delivery-times'] })
      return response
    },
    enabled: !!options?.enabled,
  })

  return {
    ...query,
    user: query.data,
    refetchUser: query.refetch,
  }
}
