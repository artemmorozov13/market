import { FC, useState } from 'react'
import { Card, CardContent, CardMedia, Typography, Chip, Box, Button } from '@mui/material'
import { CheckCircle, Cancel, Edit, Delete } from '@mui/icons-material'
import styles from './OfferedProduct.module.scss'
import { PostNewProductModalForm } from '@features/PostNewProducts'
import { ProductType } from '@core/types/product-item'
import { ProductStatusEnum } from '@core/enums/product-status-enum'
import { formatRubbles } from '@core/utils/formatRubbles'

interface OfferedProductProps {
  offeredProduct: ProductType
  handleUpdateProduct: (data: ProductType) => void
  handleDeleteProduct: (productId: number) => void
}

export const OfferedProduct: FC<OfferedProductProps> = (props) => {
  const { offeredProduct, handleUpdateProduct, handleDeleteProduct } = props

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)

  const handleEditProduct = () => setIsEditModalOpen(true)

  const getStatusChip = () => {
    switch (offeredProduct.status) {
      case ProductStatusEnum.Accepted:
        return <Chip icon={<CheckCircle />} label="Принят в продажу" color="success" size="small" />
      case ProductStatusEnum.Rejected:
        return <Chip icon={<Cancel />} label="Отменен администратором" color="error" size="small" />
      case ProductStatusEnum.Moderation:
        return <Chip label="На рассмотрении" color="info" size="small" />
      case ProductStatusEnum.Expired:
        return <Chip label="Удален администратором" color="default" size="small" />
      default:
        return null
    }
  }

  const renderActions = () => {
    switch (offeredProduct.status) {
      case ProductStatusEnum.Moderation:
        return (
          <>
            <Button variant="outlined" startIcon={<Edit />} onClick={handleEditProduct}>
              Редактировать
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => handleDeleteProduct(offeredProduct.id)}
            >
              Удалить
            </Button>
          </>
        )

      case ProductStatusEnum.Accepted:
        return (
          <Button variant="outlined" startIcon={<Edit />} onClick={handleEditProduct}>
            Редактировать
          </Button>
        )

      case ProductStatusEnum.Rejected:
        return (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Edit />}
            onClick={handleEditProduct}
          >
            Редактировать
          </Button>
        )

      case ProductStatusEnum.Expired:
        return (
          <>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Edit />}
              onClick={handleEditProduct}
            >
              Редактировать
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => handleDeleteProduct(offeredProduct.id)}
            >
              Удалить
            </Button>
          </>
        )

      default:
        return null
    }
  }

  return (
    <Card className={styles.productCard}>
      <PostNewProductModalForm
        product={offeredProduct}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        handleUpdateProduct={handleUpdateProduct}
      />

      <CardMedia
        component="img"
        height="200"
        image={offeredProduct.image}
        alt={offeredProduct.name}
        className={styles.image}
      />

      <CardContent className={styles.wrapper}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h5" className={styles.name}>
            {offeredProduct.name}
          </Typography>
          {getStatusChip()}
        </Box>

        <Typography variant="body2" color="text.secondary" mb={1}>
          {offeredProduct.description}
        </Typography>

        {/* Display cancellation comment if status is rejected */}
        {offeredProduct.status === ProductStatusEnum.Rejected && offeredProduct.canelComment && (
          <Box mb={1}>
            <Typography variant="body2" color="error">
              <strong>Причина отказа:</strong> {offeredProduct.canelComment}
            </Typography>
          </Box>
        )}

        <Typography variant="h6" mb={2}>
          {formatRubbles(offeredProduct.offeredPrice)}
          {!Number(offeredProduct.discount) && (
            <Typography
              component="span"
              variant="body2"
              color="text.secondary"
              sx={{ textDecoration: 'line-through', ml: 1 }}
            >
              {formatRubbles(offeredProduct.discount)}
            </Typography>
          )}
        </Typography>

        <Box className={styles.actions} display="flex" gap={1} flexWrap="wrap">
          {renderActions()}
        </Box>
      </CardContent>
    </Card>
  )
}
