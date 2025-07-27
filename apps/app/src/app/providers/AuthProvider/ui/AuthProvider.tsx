import { FC, ReactNode, useState, useEffect } from "react"
import { CircularProgress } from "@mui/material"
import styles from "./AuthProvider.module.scss"
import 'react-toastify/dist/ReactToastify.css'
import { userStore, useUser } from "@/entities/User"
import { TelegramAuthData } from '@telegram-auth/react';
import { LOCALSTORAGE_STOREID_KEY } from "@/shared/consts/applicationConsts";

interface AuthProviderProps {
  children: ReactNode
}

const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const urlParams = new URLSearchParams(window.location.search);
  const storeId = urlParams.get("store");

  const { user } = useUser({ storeId })

  if (!user) {
    return (
      <div className={styles.wrapper}>
        <CircularProgress/>
      </div>
    )
  }
  return children
}

export default AuthProvider