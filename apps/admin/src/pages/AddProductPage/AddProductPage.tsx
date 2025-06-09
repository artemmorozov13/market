import { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { ShopOwnerLayout } from '@widgets/ShopOwnerLayout';
import { ProductForm } from '@features/PostNewProducts';
import { ProductType, createProduct } from '@entities/Product';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormType } from '@features/PostNewProducts';
import { toast } from 'react-toastify';


export const AddProductPage: FC = observer(() => {
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