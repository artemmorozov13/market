import { FC, ReactNode } from "react"
import { useUser } from "../api/fetchUserData"
import 'react-toastify/dist/ReactToastify.css'

interface AuthProviderProps {
  children: ReactNode
}

const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const user = useUser({ initData: "user=%7B%22id%22%3A6884424207%2C%22first_name%22%3A%22%D0%9C%D0%B0%D0%BA%D1%81%D0%B8%D0%BC%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22maksimmaksim23456%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2Fve63cVSTrYikS-se5UnP6M5VijxgSZeQbmlrjsen51TweCDFevDHUVwI5pv0pRpa.svg%22%7D&chat_instance=-5918574090518039548&chat_type=sender&auth_date=1743508631&signature=vv8wLEWV4ZPFKsH6KxrPErl0r0gVIcZYaAav790g65cLUTh1rR6dJi89za0pWXxpEeEyMDqdAx3n5CT5kp-2DA&hash=90cebd218f44e0a20df64649a6745662eb71997500bdd9fee02b6464760b96e7" })

  if (user.isLoading) {
    return <>loading...</>
  }

  return children
}

export default AuthProvider