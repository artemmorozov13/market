import { Container, Modal, Paper } from "@mui/material";
import { FC } from "react";
import { ProductForm } from "./PostNewProducts";
import styles from "./PostNewProducts.module.scss";
import { ProductType, editProduct, fetchProductsData } from "@entities/Product";
import { UseFormReturn } from "react-hook-form";
import { ProductFormType } from "../types/postNewProductTypes";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

interface PostNewProductsFormProps {
  isOpen: boolean;
  product: ProductType;
  onClose: () => void;
  handleUpdateProducts: (value: React.SetStateAction<ProductType[]>) => void
}

export const PostNewProductModalForm: FC<PostNewProductsFormProps> = (props) => {
  const { isOpen, product, onClose, handleUpdateProducts } = props;

  const editNewProduct = async (
    data: ProductType,
    methods: UseFormReturn<ProductFormType, any, undefined>
  ) => {
    try {
      await editProduct(data);
      handleUpdateProducts(prev => prev.map((product) => {
        if (product.id === data.id) {
          return {
            ...product,
            ...data,
          }
        }
        return product
      }))
      toast("Товар отредактирован", { type: "success" });
      onClose();
    } catch (error) {
      toast("Ошибка сервера при редактировании товара", { type: "error" });
      console.error(error);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} className={styles.root}>
      <Paper className={styles.paper}>
        <Container className={styles.container}>
          <ProductForm
            initialValues={product}
            onSubmit={editNewProduct}
          />
        </Container>
      </Paper>
    </Modal>
  );
};