import { FC, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Pagination } from "@mui/material";
import styles from "./AsortimentListPage.module.scss";
import { ShopOwnerLayout } from "@widgets/ShopOwnerLayout";
import { Product, ProductType, fetchProductsData } from "@entities/Product";

const PRODUCTS_PER_PAGE = 12;

export const AsortimentListPage: FC = observer(() => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState<ProductType[]>([])

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const fetchProducts = async () => {
    setIsLoading(true)
    const response = await fetchProductsData({
      skip: (page - 1) * PRODUCTS_PER_PAGE,
      take: PRODUCTS_PER_PAGE
    })
    const totalPages = Math.ceil(response.pagination.total / PRODUCTS_PER_PAGE)
    setTotalPages(totalPages)
    setProducts(response.items)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [page])

  if (isLoading) {
    return (
      <ShopOwnerLayout>
        <span className={styles.title}>Список товаров магазина</span>
        <div className={styles.root}>
          <div>Загрузка...</div>
        </div>
      </ShopOwnerLayout>
    );
  }

  return (
    <ShopOwnerLayout>
      <span className={styles.title}>Список товаров магазина</span>
      <div className={styles.root}>
        {products.map((product: ProductType) => (
          <Product
            key={product.id}
            product={product}
            handleUpdateProducts={setProducts} />
        ))}
      </div>
      <div className={styles.pagination}>
        <Pagination
          page={page}
          count={totalPages}
          onChange={handlePageChange}
          color="primary"
        />
      </div>
    </ShopOwnerLayout>
  );
});