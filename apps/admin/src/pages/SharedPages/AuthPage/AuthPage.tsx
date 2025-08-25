import { FC } from 'react'
import styles from './AuthPage.module.scss'
import { AuthForm } from '@features/AuthFrom'

export const AuthPage: FC = () => {
  return (
    <div className={styles.root}>
      <AuthForm />
    </div>
  )
}
