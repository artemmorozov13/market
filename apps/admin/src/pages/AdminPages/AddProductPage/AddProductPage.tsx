import { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { ShopOwnerLayout } from '@widgets/ShopOwnerLayout';
import { ProductForm } from '@features/PostNewProducts';
import { useCreateProduct } from '@entities/Product';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormType } from '@features/PostNewProducts';
import { toast } from 'react-toastify';
import { ProductType } from '@core/types/product-item';


const AddProductPage: FC = observer(() => {
    const { createProduct } = useCreateProduct()

    const createNewProduct = (data: ProductType, methods: UseFormReturn<ProductFormType, any, undefined>) => {
        createProduct(data)
        .then(() => {
            toast("Добавлен новый товар", { type: "success" })
            methods.reset()
        })
        .catch(() => {
            toast("Ошибка сервера при создании нового товара", { type: "error" })
        })
    }

    return (
        <ShopOwnerLayout>
            <ProductForm onSubmit={createNewProduct} />
        </ShopOwnerLayout>
    )
})

export default AddProductPage
