import { FC } from 'react'
import { StoreBaseType } from '@core/types/store-type'
import { StoreCard } from '@/entities/Store'

import styles from './StoreList.module.scss'

interface StoreListProps {
  stores?: StoreBaseType[]
}

export const StoreList: FC<StoreListProps> = ({ stores }) => {
  return (
    <div className={styles.container}>
      {stores?.map((store) => (
        <StoreCard store={store} />
      ))}
    </div>
  )
}
