import { FC, ReactNode } from "react"
import { useUser } from "../api/fetchUserData"
import { CircularProgress } from "@mui/material"
import styles from "./AuthProvider.module.scss"
import 'react-toastify/dist/ReactToastify.css'
import WebApp from "@twa-dev/sdk"

interface AuthProviderProps {
  children: ReactNode
}

const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const user = useUser({ initData: WebApp.initData })

  if (user.isLoading) {
    return (
      <div className={styles.wrapper}>
        <CircularProgress/>
      </div>
    )
  }

  return children
}

export default AuthProvider