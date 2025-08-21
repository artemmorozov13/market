import { useUser } from '@entities/User'
import { StoreEditForm } from '@widgets/StoreEditForm'
import { ShopOwnerLayout } from '@widgets/ShopOwnerLayout'
import { FC } from 'react'
import styles from './ShopSettingsPage.module.scss'
import { Alert, CircularProgress, Typography } from '@mui/material'

const ShopSettingsPage: FC = () => {
  const { user, isPending } = useUser()

  if (isPending) {
    return (
      <ShopOwnerLayout>
        <div className={styles.loadingContainer}>
          <CircularProgress />
        </div>
      </ShopOwnerLayout>
    )
  }

  if (!user?.store) {
    return (
      <ShopOwnerLayout>
        <Alert severity="error" className={styles.alert}>
          Данные магазина не найдены
        </Alert>
      </ShopOwnerLayout>
    )
  }

  return (
    <ShopOwnerLayout>
      <div className={styles.pageContainer}>
        <Typography variant="h4" component="h1" className={styles.title}>
          Настройки магазина
        </Typography>
        <StoreEditForm storeData={user.store} />
      </div>
    </ShopOwnerLayout>
  )
}

export default ShopSettingsPage
