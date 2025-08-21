import { useEffect, useState } from 'react'
import { TelegramAuthData } from '@telegram-auth/react'

export const useTelegramAuthData = () => {
  const [initData, setInitData] = useState<TelegramAuthData | null>(null)

  const extractTelegramData = (): TelegramAuthData | null => {
    const urlParams = new URLSearchParams(window.location.search)

    if (!urlParams.has('hash')) return null

    const authDate = urlParams.get('auth_date')
    const id = urlParams.get('id')

    if (!authDate || !id) return null

    return {
      id: parseInt(id),
      first_name: urlParams.get('first_name') || '',
      last_name: urlParams.get('last_name') || '',
      username: urlParams.get('username') || '',
      photo_url: urlParams.get('photo_url') || '',
      auth_date: parseInt(authDate),
      hash: urlParams.get('hash') || '',
    }
  }

  useEffect(() => {
    const data = extractTelegramData()
    if (data) {
      setInitData(data)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  return { initData }
}
