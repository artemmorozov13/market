import { FC, ReactNode } from "react"
import { useUser } from "../api/fetchUserData"
import { CircularProgress } from "@mui/material"
import styles from "./AuthProvider.module.scss"
import 'react-toastify/dist/ReactToastify.css'

interface AuthProviderProps {
  children: ReactNode
}

const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const user = useUser({ initData: "user=%7B%22id%22%3A1757722413%2C%22first_name%22%3A%22%D0%90%D1%80%D1%82%D1%91%D0%BC%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22morozov4%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F_rDZfRTHKorzqIPlv0JLWGw3NqviMc6n-V-A4CkDZQ8.svg%22%7D&chat_instance=-5138780923671128731&chat_type=private&auth_date=1747641695&signature=Zyhv-MgnukEykgsJtmah0RyKn6vs71GN9gx0I4AJJRqdLHIafeegNy6gEiCrid7tdHd2a4dKQeiFNeHs5fyZBw&hash=d9d05856db11761c5abf9c89789f936e014ec4a3ccf64e1304d5861b921eb545" })

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