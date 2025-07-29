import { FC, ReactNode } from "react"
import { CircularProgress } from "@mui/material"
import styles from "./AuthProvider.module.scss"
import 'react-toastify/dist/ReactToastify.css'
import { userStore, useUser } from "@/entities/User"
import { StartupScreen } from "@/widgets/StartupScreen"
import { Roles } from "@core/enums/role-enum"
import { observer } from "mobx-react-lite"
import Cookies from "js-cookie"
import { REFRESH_TOKEN } from "@/shared/consts/applicationConsts"

interface AuthProviderProps {
  children: ReactNode
}

const AuthProvider: FC<AuthProviderProps> = observer(({ children }) => {
  const urlParams = new URLSearchParams(window.location.search);
  const storeId = urlParams.get("store");
  const refreshToken = Cookies.get(REFRESH_TOKEN);
  const { user } = useUser({
    storeId,
    enabled: !!refreshToken
  })


  if (!refreshToken) {
    return (
      <StartupScreen/>
    )
  }
  if (!user) {
    return (
      <div className={styles.wrapper}>
        <CircularProgress/>
      </div>
    )
  }
  return children
})

export default AuthProvider