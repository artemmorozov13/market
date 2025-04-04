import { FC, ReactNode } from "react"
import { useUser } from "../api/fetchUserData"
import 'react-toastify/dist/ReactToastify.css'
import WebApp from "@twa-dev/sdk"

interface AuthProviderProps {
  children: ReactNode
}

const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const user = useUser({ initData: "query_id=AAEtt8RoAAAAAC23xGjVIV-5&user=%7B%22id%22%3A1757722413%2C%22first_name%22%3A%22%D0%90%D1%80%D1%82%D1%91%D0%BC%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22morozov4%22%2C%22language_code%22%3A%22en%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F_rDZfRTHKorzqIPlv0JLWGw3NqviMc6n-V-A4CkDZQ8.svg%22%7D&auth_date=1743600380&signature=6BAAyAt5OsG8NDfqlBvXnHIwO-77klBSOc-pGM-dlGIBOT1wfEEu8HW-Wm7J_QTJeqbvNri8d41kh2e-3pSRAQ&hash=c919bd80ec5ed7e9a586b76ee2f737a3b8940a51708c4695eb4891db00c68465" })

  if (user.isLoading) {
    return <>loading...</>
  }

  return children
}

export default AuthProvider