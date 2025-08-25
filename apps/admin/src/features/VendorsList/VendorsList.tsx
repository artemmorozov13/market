import { ProductStatusEnum } from '@core/enums/product-status-enum'
import { StoreUserBaseType } from '@core/types/store-user'
import { useChangeProductStatus } from '@entities/OfferedProduct'
import { SupplierCard } from '@entities/Supplier'
import { FC } from 'react'

interface SuppliersListProps {
  suppliers?: StoreUserBaseType[]
}

export const SuppliersList: FC<SuppliersListProps> = ({ suppliers }) => {
  const { changeProductStatus } = useChangeProductStatus()

  const handleChangeStatus = (productId: number, status: ProductStatusEnum, comment?: string) => {
    if (status === ProductStatusEnum.Accepted) {
      return changeProductStatus(productId, ProductStatusEnum.Accepted)
    }
    return changeProductStatus(productId, ProductStatusEnum.Rejected, comment)
  }

  return (
    <div>
      {suppliers?.map((supplier) => (
        <SupplierCard
          key={supplier.id}
          supplier={supplier}
          onProductStatusChange={handleChangeStatus}
        />
      ))}
    </div>
  )
}
