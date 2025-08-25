import { FC } from 'react'
import { Grid, Typography } from '@mui/material'
import styles from './OfferProductsList.module.scss'
import {
  OfferedProduct,
  useDeleteOfferedProduct,
  useUpdateOfferedProduct,
} from '@entities/OfferedProduct'
import { ProductType } from '@core/types/product-item'

interface OfferProductsListProps {
  products: ProductType[]
}

export const OfferProductsList: FC<OfferProductsListProps> = ({ products }) => {
  const { updateProduct } = useUpdateOfferedProduct()
  const { deleteOfferedProduct } = useDeleteOfferedProduct()

  const handleDeleteProduct = (productId: number) => {
    deleteOfferedProduct(productId)
  }

  const handleUpdateProduct = (data: ProductType) => {
    updateProduct(data)
  }

  if (!products?.length) {
    return (
      <Typography variant="h5" className={styles.title}>
        Вы еще не добавляли товары
      </Typography>
    )
  }
  return (
    <div className={styles.container}>
      <Grid container spacing={3}>
        {products?.map((product) => (
          <Grid item key={product.name} xs={12} sm={6} md={4} lg={3}>
            <OfferedProduct
              key={product.id}
              offeredProduct={product}
              handleUpdateProduct={handleUpdateProduct}
              handleDeleteProduct={handleDeleteProduct}
            />
          </Grid>
        ))}
      </Grid>
    </div>
  )
}
