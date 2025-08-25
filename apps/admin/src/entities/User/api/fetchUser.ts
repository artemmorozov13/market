import { API } from '@shared/api/instance'
import { useQuery } from '@tanstack/react-query'
import { StoreUserBaseType } from '@core/types/store-user'

interface FetchUserOptions {
  onSuccess?: (user: StoreUserBaseType) => void
  enabled?: boolean
}

export const fetchUser = async (options?: FetchUserOptions) => {
  try {
    const response = await API.get<StoreUserBaseType>('/store-user')

    if (options?.onSuccess) {
      options.onSuccess(response.data)
    }

    return response.data
  } catch {
    throw new Error()
  }
}

export const useUser = (options?: FetchUserOptions) => {
  const query = useQuery({
    queryKey: ['user'],
    queryFn: () => fetchUser(options),
    enabled: !!options?.enabled,
  })
  return {
    ...query,
    user: query.data,
  }
}
