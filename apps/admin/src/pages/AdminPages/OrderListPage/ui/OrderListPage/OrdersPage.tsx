import React, { FC, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Pagination } from "@mui/material";
import styles from "./OrdersPage.module.scss";
import { ShopOwnerLayout } from "@widgets/ShopOwnerLayout";
import { OrderList } from "../OrderList/OrderList";
import { OrderType } from "@entities/Order";
import { fetchOrderData } from "@entities/Order/api/fetchOrderData";


export const OrdersPage: FC = observer(() => {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const take = 10; // Количество заказов на странице

  // Функция для загрузки данных
  const loadOrders = async (page: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const skip = (page - 1) * take;
      const response = await fetchOrderData({ skip, take });
      setOrders(response.items);
      setTotalPages(Math.ceil(response.pagination.total / take));
    } catch (err) {
      console.error("Ошибка при загрузке заказов:", err);
      setError("Не удалось загрузить заказы. Попробуйте снова.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(currentPage);
  }, [currentPage]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <ShopOwnerLayout>
        <span className={styles.title}>Список заказов</span>
        <div className={styles.root}>
          <div>Загрузка...</div>
        </div>
      </ShopOwnerLayout>
    );
  }

  return (
    <ShopOwnerLayout>
      <span className={styles.title}>Список заказов</span>
      <div className={styles.root}>
        <OrderList orders={orders} />
        <div className={styles.pagination}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </div>
      </div>
    </ShopOwnerLayout>
  );
});