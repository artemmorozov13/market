import { Container, Modal, Paper } from "@mui/material";
import { FC } from "react";
import { ProductForm } from "./PostNewProducts";
import styles from "./PostNewProducts.module.scss";
import { ProductType } from "@core/types/product-item";

interface PostNewProductsFormProps {
  isOpen: boolean;
  product: ProductType;
  onClose: () => void;
  handleUpdateProduct: (product: ProductType) => void
}

export const PostNewProductModalForm: FC<PostNewProductsFormProps> = (props) => {
  const { isOpen, product, onClose, handleUpdateProduct } = props;

  const updateProducts = (product: ProductType) => {
    handleUpdateProduct(product)
    onClose()
  }

  return (
    <Modal open={isOpen} onClose={onClose} className={styles.root}>
      <Paper className={styles.paper}>
        <Container className={styles.container}>
          <ProductForm
            initialValues={product}
            onSubmit={updateProducts}
          />
        </Container>
      </Paper>
    </Modal>
  );
};