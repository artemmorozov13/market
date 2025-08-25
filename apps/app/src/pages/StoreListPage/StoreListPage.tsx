import { Layout } from '@/widgets/Layout'
import { FC } from 'react'
import styles from './StoreListPage.module.scss'
import { useStores } from '@/entities/Store'
import { StoreList } from '@/features/StoreList'
import { ManageAddressForm } from '@/features/ManageAddressForm'

const StoreListPage: FC = () => {
  const { stores } = useStores()

  return (
    <Layout>
      <div className={styles.root}>
        <ManageAddressForm />
        <StoreList stores={stores} />
      </div>
    </Layout>
  )
}

export default StoreListPage
