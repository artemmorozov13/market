import { FC, ReactNode } from "react"
import { useUser } from "../api/fetchUserData"
import 'react-toastify/dist/ReactToastify.css'

interface AuthProviderProps {
  children: ReactNode
}

const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const user = useUser()

  if (user.isLoading) {
    return <>loading...</>
  }

  return children
}

export default AuthProvider