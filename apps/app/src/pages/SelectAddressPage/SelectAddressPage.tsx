import { ManageAddressForm } from '@/features/ManageAddressForm'
import { Container, Typography } from '@mui/material'
import { FC } from 'react'
import styles from './SelectAddressPage.module.scss'

const SelectAddressPage: FC = () => {
  return (
    <Container className={styles.root}>
      <div className={styles.wrapper}>
        <ManageAddressForm />
      </div>
    </Container>
  )
}

export default SelectAddressPage
