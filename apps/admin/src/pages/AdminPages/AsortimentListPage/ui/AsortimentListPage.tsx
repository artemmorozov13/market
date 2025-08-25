import { FC, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Pagination } from '@mui/material'
import styles from './AsortimentListPage.module.scss'
import { ShopOwnerLayout } from '@widgets/ShopOwnerLayout'
import {
  Product,
  useDeleteProduct,
  useEditProduct,
  useProducts,
  useRecoverProduct,
} from '@entities/Product'
import { ProductType } from '@core/types/product-item'
import { useChangeProductStatus } from '@entities/OfferedProduct'
import { ProductStatusEnum } from '@core/enums/product-status-enum'

const PRODUCTS_PER_PAGE = 12

export const AsortimentListPage: FC = observer(() => {
  const [page, setPage] = useState(1)

  const { products, isPending, error } = useProducts({
    limit: PRODUCTS_PER_PAGE,
    skip: (page - 1) * PRODUCTS_PER_PAGE,
  })

  const { recoverProduct } = useRecoverProduct()
  const { deleteProduct } = useDeleteProduct()
  const { updateProduct } = useEditProduct()
  const { changeProductStatus } = useChangeProductStatus()

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
  }

  const handleDeleteProduct = (productId: number) => {
    deleteProduct(productId)
  }

  const handleRecoverProduct = (productId: number) => {
    recoverProduct(productId)
  }

  const handleUpdateProduct = (data: ProductType) => {
    updateProduct(data)
  }

  const handleRevokeProduct = (productId: number) => {
    changeProductStatus(productId, ProductStatusEnum.Rejected)
  }

  if (isPending) {
    return (
      <ShopOwnerLayout>
        <span className={styles.title}>Список товаров магазина</span>
        <div className={styles.root}>
          <div>Загрузка...</div>
        </div>
      </ShopOwnerLayout>
    )
  }

  if (error) {
    return (
      <ShopOwnerLayout>
        <span className={styles.title}>Список товаров магазина</span>
        <div className={styles.root}>
          <div>Ошибка загрузки данных: {error.message}</div>
        </div>
      </ShopOwnerLayout>
    )
  }

  if (!products?.items?.length) {
    return (
      <ShopOwnerLayout>
        <span className={styles.title}>Список товаров магазина</span>
        <div className={styles.root}>
          <div>Товары не найдены</div>
        </div>
      </ShopOwnerLayout>
    )
  }

  const totalPages = products?.pagination?.total
    ? Math.ceil(products.pagination.total / PRODUCTS_PER_PAGE)
    : 1

  return (
    <ShopOwnerLayout>
      <span className={styles.title}>Список товаров магазина</span>
      <div className={styles.root}>
        {products.items.map((product: ProductType) => (
          <Product
            key={product.id}
            product={product}
            handleUpdateProduct={handleUpdateProduct}
            handleDeleteProduct={handleDeleteProduct}
            handleRecoverProduct={handleRecoverProduct}
            handleRevokeProduct={handleRevokeProduct}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <Pagination page={page} count={totalPages} onChange={handlePageChange} color="primary" />
        </div>
      )}
    </ShopOwnerLayout>
  )
})
