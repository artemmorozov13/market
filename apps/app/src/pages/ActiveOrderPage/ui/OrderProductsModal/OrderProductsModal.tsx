import { API } from '@/shared/api/API'
import { FC, useState } from 'react'
import styles from './OrderProductsModal.module.scss'
import { Button, Modal, TextField, Typography } from '@mui/material'
import { ProductType } from '@core/types/product-item'

export const OrderProductsModal: FC<any> = ({ open, onClose, order, refreshOrders }) => {
  const [products, setProducts] = useState(order?.products || [])

  const handleAddProduct = () => {
    setProducts([...products, { id: Date.now(), name: 'Новый продукт', quantity: 1 }])
  }

  const handleSave = async () => {
    await API.post('/order/update-order', { id: order.id, products })
    refreshOrders()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.modalContent}>
        <Typography variant="h6">Редактирование товаров</Typography>
        {products.map((product: ProductType, index: number) => (
          <TextField key={index} label="Название" value={product.name} fullWidth />
        ))}
        <Button onClick={handleAddProduct} variant="outlined">
          Добавить товар
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Сохранить
        </Button>
      </div>
    </Modal>
  )
}
