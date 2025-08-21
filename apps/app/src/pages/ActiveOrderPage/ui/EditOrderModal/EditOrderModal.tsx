import { FC, useEffect, useState } from 'react'
import {
  Modal,
  Box,
  Typography,
  Button,
  Stack,
  Tooltip,
  IconButton,
  Skeleton,
  Chip,
} from '@mui/material'
import { Order, OrderedProduct } from '../../types/activeOrderTypes'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import { observer, useLocalObservable } from 'mobx-react-lite'
import { editOrderModalStore } from '../../store/editOrderModalStore'
import { usePagedProductsList } from '@/entities/Product'
import { useInView } from 'react-intersection-observer'
import { useUpdateOrder } from '../../api/useUpdateOrder'

import styles from './EditOrderModal.module.scss'
import { BasketBaseType } from '@core/types/basket-tipe'
import { StoreBaseType } from '@core/types/store-type'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { formatRubbles } from '@core/utils/formatRubbles'

interface EditOrderModalProps {
  open: boolean
  onClose: () => void
  order: Order | null
}

export interface OrderBasketType extends Omit<BasketBaseType, 'id' | 'userTgchatId'> {
  isInBasket: boolean
}

export const EditOrderModal: FC<EditOrderModalProps> = observer((props) => {
  const { open, onClose, order } = props

  const { updateOrder } = useUpdateOrder()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = usePagedProductsList({
    take: 10,
    storeId: order?.store?.id,
    enabled: true,
  })

  const { ref, inView } = useInView({
    threshold: 0.1,
  })

  const editOrderStore = useLocalObservable(editOrderModalStore)
  const {
    editingOrder,
    adaptedProducts,
    selectedProducts,
    updateEditingOrder,
    increaseProduct,
    decreaseProduct,
    updateSelectedProducts,
    updateAdaptedProducts,
  } = editOrderStore

  const [isOpenInnerModal, setIsOpenInnerModal] = useState<boolean>(false)

  // Функция для расчета цены со скидкой
  const getDiscountedPrice = (price: number, discount: number) => {
    return price * (1 - discount / 100)
  }

  // Функция для отображения цены со скидкой
  const renderPrice = (product: { price: number | string; discount?: number | string | null }) => {
    const price = Number(product.price)
    const discount = Number(product.discount) || 0

    if (discount > 0) {
      const discountedPrice = getDiscountedPrice(price, discount)
      return (
        <Box>
          <Typography className={styles.productPrice} sx={{ color: 'error.main', fontWeight: 500 }}>
            {formatRubbles(discountedPrice)}
          </Typography>
          <Typography
            className={styles.productPrice}
            sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
          >
            {formatRubbles(price)}
          </Typography>
          <Chip
            label={`-${discount}%`}
            size="small"
            color="error"
            sx={{ height: 20, fontSize: '0.75rem' }}
          />
        </Box>
      )
    }

    return <Typography className={styles.productPrice}>{formatRubbles(price)}</Typography>
  }

  // Функция для расчета общей суммы товара
  const calculateItemTotal = (price: number, quantity: number, discount?: number | null) => {
    const effectiveDiscount = Number(discount) || 0
    const effectivePrice =
      effectiveDiscount > 0 ? getDiscountedPrice(price, effectiveDiscount) : price
    return formatRubbles(effectivePrice * quantity)
  }

  const handlePlusProduct = (productId: number) => {
    increaseProduct(productId)
    handleAddProduct(productId)
  }

  const handleMinusProduct = (productId: number) => {
    decreaseProduct(productId)
    handleRemoveProduct(productId)
  }

  const handleToggleBasketStatus = (productId: number) => {
    const updated = adaptedProducts.map((product) => {
      if (product.productId === productId) {
        return {
          ...product,
          isInBasket: true,
          quantity: 1,
        }
      }
      return product
    })
    updateAdaptedProducts(updated)
    updateSelectedProducts([...selectedProducts, productId])
  }

  const handleAddProduct = (productId: number) => {
    const updated = adaptedProducts.map((product) => {
      if (product.productId === productId) {
        return {
          ...product,
          quantity: product.quantity + 1,
        }
      }
      return product
    })
    updateAdaptedProducts(updated)
  }

  const handleRemoveProduct = (productId: number) => {
    const updated = adaptedProducts.map((product) => {
      if (product.productId !== productId) {
        return product
      }
      if (product.quantity > 1) {
        return {
          ...product,
          quantity: product.quantity - 1,
        }
      }
      updateSelectedProducts(selectedProducts.filter((selectedId) => selectedId !== productId))
      return {
        ...product,
        isInBasket: false,
        quantity: 0,
      }
    })
    updateAdaptedProducts(updated)
  }

  const handleUpdateOrder = () => {
    if (editingOrder) {
      updateOrder(editingOrder)
      onClose()
    }
  }

  const handleAddProducts = () => {
    if (editingOrder) {
      const orderedProducts = adaptedProducts?.map((item) => item.product.id)
      const updatedOrderedProducts = editingOrder.ordered_products.filter(
        (product) => !orderedProducts.includes(product.product.id),
      )
      const newOrderedProducts = adaptedProducts
        .filter((product) => product.isInBasket)
        .map((product): Omit<OrderedProduct, 'id' | 'telegram_id'> => {
          return {
            product: product.product,
            quantity: product.quantity,
          }
        })

      const updatedOrder: Order = {
        ...editingOrder,
        ordered_products: [...updatedOrderedProducts, ...(newOrderedProducts as OrderedProduct[])],
      }
      updateEditingOrder(updatedOrder)
      setIsOpenInnerModal(false)
    }
  }

  const onOpenInnerModal = () => {
    setIsOpenInnerModal(true)
  }

  useEffect(() => {
    if (order) {
      updateEditingOrder(order)
    }
    const products = data?.pages.flatMap((page) => page.items) || []
    const orderedProducts = order?.ordered_products.map((item) => item.product.id)
    const update = products
      .filter((product) => !orderedProducts?.includes(product.id))
      .map(
        (product): OrderBasketType => ({
          product: product,
          productId: product.id,
          quantity: 0,
          store: order?.store as StoreBaseType,
          isInBasket: false,
        }),
      )
    updateAdaptedProducts(update)

    const updateSelected = adaptedProducts
      .filter((product) => product.isInBasket)
      .map((product) => product.productId)
    updateSelectedProducts(updateSelected)
  }, [data])

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

  return (
    <Modal open={open} onClose={onClose}>
      {isOpenInnerModal ? (
        <Box className={styles.innerModal}>
          <Box className={styles.innerList}>
            {adaptedProducts.map((product) => (
              <div key={product.productId} className={styles.productItem}>
                <LazyLoadImage
                  src={product.product.image}
                  alt={product.product.name}
                  className={styles.productImage}
                />
                <Box className={styles.productInfo}>
                  <Typography className={styles.productName}>{product.product.name}</Typography>
                  {renderPrice(product.product)}
                </Box>
                {selectedProducts?.includes(product.product.id) ? (
                  <Box className={styles.basketControls}>
                    <Box className={styles.quantityControls}>
                      <Tooltip title="Уменьшить количество">
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveProduct(product.product.id)}
                          className={styles.quantityButton}
                        >
                          <RemoveCircleOutlineIcon />
                        </IconButton>
                      </Tooltip>
                      <Typography className={styles.quantityValue}>{product.quantity}</Typography>
                      <Tooltip title="Увеличить количество">
                        <IconButton
                          size="small"
                          onClick={() => handleAddProduct(product.product.id)}
                          className={styles.quantityButton}
                        >
                          <AddCircleOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Typography className={styles.totalPrice}>
                      {`${calculateItemTotal(
                        Number(product.product.price),
                        product.quantity,
                        Number(product.product.discount),
                      )}`}
                      {product.product.discount && Number(product.product.discount) > 0 && (
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{
                            textDecoration: 'line-through',
                            color: 'text.secondary',
                            ml: 1,
                          }}
                        >
                          {formatRubbles(Number(product.product.price) * product.quantity)}
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                ) : (
                  <Button
                    variant="contained"
                    size="medium"
                    className={styles.addProductBtn}
                    onClick={() => handleToggleBasketStatus(product.productId)}
                    fullWidth
                  >
                    Добавить
                  </Button>
                )}
              </div>
            ))}
          </Box>
          {isFetchingNextPage &&
            Array.from({ length: 3 }).map((_, idx) => (
              <Box key={idx} className={styles.grid}>
                <Skeleton variant="rectangular" height={200} />
              </Box>
            ))}

          <Box ref={ref} className={styles.refetchBlock} />

          <Box className={styles.actions}>
            <Button
              variant="contained"
              onClick={handleAddProducts}
              className={styles.closeButton}
              fullWidth
            >
              Готово
            </Button>
          </Box>
        </Box>
      ) : (
        <Box className={styles.modal}>
          <Typography variant="h6" className={styles.title}>
            Редактирование заказа №{order?.id}
          </Typography>
          <Button
            variant="contained"
            onClick={onOpenInnerModal}
            className={styles.closeButton}
            fullWidth
          >
            Добавить новый товар
          </Button>
          <Stack spacing={2} className={styles.productsList}>
            {editingOrder?.ordered_products.map((ordered_product) => {
              const totalWithDiscount = calculateItemTotal(
                Number(ordered_product.product.price),
                ordered_product.quantity,
                Number(ordered_product.product.discount),
              )
              const totalWithoutDiscount =
                Number(ordered_product.product.price) * ordered_product.quantity
              const hasDiscount =
                ordered_product.product.discount && Number(ordered_product.product.discount) > 0

              return (
                <Box key={ordered_product.id} className={styles.productItem}>
                  <LazyLoadImage
                    src={ordered_product.product.image}
                    alt={ordered_product.product.name}
                    className={styles.productImage}
                  />
                  <Box className={styles.productInfo}>
                    <Typography className={styles.productName}>
                      {ordered_product.product.name}
                    </Typography>
                    {renderPrice(ordered_product.product)}

                    <Box className={styles.basketControls}>
                      <Box className={styles.quantityControls}>
                        <Tooltip title="Уменьшить количество">
                          <IconButton
                            size="small"
                            onClick={() => handleMinusProduct(ordered_product.product.id)}
                            className={styles.quantityButton}
                          >
                            <RemoveCircleOutlineIcon />
                          </IconButton>
                        </Tooltip>
                        <Typography className={styles.quantityValue}>
                          {ordered_product.quantity}
                        </Typography>
                        <Tooltip title="Увеличить количество">
                          <IconButton
                            size="small"
                            onClick={() => handlePlusProduct(ordered_product.product.id)}
                            className={styles.quantityButton}
                          >
                            <AddCircleOutlineIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Typography className={styles.totalPrice}>
                        {totalWithDiscount}
                        {hasDiscount && (
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{
                              textDecoration: 'line-through',
                              color: 'text.secondary',
                              ml: 1,
                            }}
                          >
                            {formatRubbles(totalWithoutDiscount)}
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )
            })}
          </Stack>

          <Box className={styles.actions}>
            <Button variant="outlined" onClick={onClose} className={styles.closeButton} fullWidth>
              Отменить
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdateOrder}
              className={styles.closeButton}
              fullWidth
            >
              Сохранить
            </Button>
          </Box>
        </Box>
      )}
    </Modal>
  )
})
