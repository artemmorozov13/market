import { FC, ReactNode } from "react"
import { useUser } from "../api/fetchUserData"
import WebApp from "@twa-dev/sdk"
import 'react-toastify/dist/ReactToastify.css'

interface AuthProviderProps {
  children: ReactNode
}

const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const user = useUser({ initData: WebApp.initData })

  if (user.isLoading) {
    return <>loading...</>
  }

  return children
}

export default AuthProvider