import { FC, ReactNode } from "react"
import { useUser } from "../api/fetchUserData"
import 'react-toastify/dist/ReactToastify.css'
import { CircularProgress } from "@mui/material"

interface AuthProviderProps {
  children: ReactNode
}

const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const user = useUser()

  if (user.isLoading) {
    return <CircularProgress/>
  }

  return children
}

export default AuthProvider