import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { FC, useEffect } from 'react'
import Cookies from 'js-cookie'
import { REFRESH_TOKEN } from '../../shared/lib/consts/consts'
import { RouteProvider } from '../providers/RouteProvider'
import { StrictMode } from 'react'
import './App.css'
import { userStore } from '../../entities/User'
import { observer } from 'mobx-react-lite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ErrorBoundary from '@app/providers/ErrorBoundary/ErrorBoundary'

const client = new QueryClient()

export const App: FC = observer(() => {
  const { fetchUserData } = userStore

  useEffect(() => {
    const token = Cookies.get(REFRESH_TOKEN)
    if (token) {
      fetchUserData()
    }
  }, [])

  return (
    <StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={client}>
          <BrowserRouter basename='/'>
            <RouteProvider />
            <ToastContainer/>
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>
  )
})
