import { FC, ReactNode, useState, useEffect } from "react"
import { CircularProgress, Box, Typography } from "@mui/material"
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import styles from "./AuthProvider.module.scss"
import 'react-toastify/dist/ReactToastify.css'
import clsx from "clsx"
import { userStore } from "@/entities/User"
import { LoginButton } from '@telegram-auth/react';
import WebApp from "@twa-dev/sdk";
import { InstallButton } from "@/shared/ui/InstallButton";
import { useUser } from "../api/fetchUserData";

interface AuthProviderProps {
  children: ReactNode
}

const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [initData, setInitData] = useState<string>("")
  const user = useUser({ initData })
  const { role } = userStore

  useEffect(() => {
    // Проверяем URL при загрузке компонента
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.toString()) {
      // Если есть параметры в URL, преобразуем их в объект
      const data: Record<string, string> = {};
      urlParams.forEach((value, key) => {
        data[key] = value;
      });
      
      // Устанавливаем initData как строку JSON
      setInitData(JSON.stringify(data));
      
      // Очищаем URL от параметров (опционально)
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleTelegramAuth = (data: any) => {
    setInitData(JSON.stringify(data))
  }

  if (user.isLoading) {
    return (
      <div className={styles.wrapper}>
        <CircularProgress/>
      </div>
    )
  }

  if (role === "notAuthed") {
    return (
      <Box className={styles.authContainer}>
        <Box className={styles.authCard}>
          <LockOutlinedIcon className={styles.authIcon} color="primary" />
          <Typography variant="h5" className={styles.authTitle}>
            Требуется авторизация
          </Typography>
          <Typography variant="body2" className={styles.authDescription}>
            Для доступа к оформлению заказа войдите через Telegram
          </Typography>
          <Box className={clsx(styles.authButtonContainer, styles.telegramButtonWrapper)}>
            <LoginButton
              botUsername={'fricti_test_bot'}
              authCallbackUrl={'https://fruvost.ru/app'}
              buttonSize="large"
              cornerRadius={8}
              showAvatar={true}
              lang="ru"
              onAuthCallback={handleTelegramAuth}
              requestAccess={'write'}
            />
          </Box>
        </Box>
        {!WebApp.initData && <InstallButton/>}
      </Box>
    )
  }

  return children
}

export default AuthProvider