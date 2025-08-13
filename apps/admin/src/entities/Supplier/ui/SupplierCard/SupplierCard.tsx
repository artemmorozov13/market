import { FC, useState } from "react";
import { 
  Badge, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  List, 
  ListItem, 
  ListItemAvatar, 
  Avatar, 
  ListItemText, 
  Typography,
  Chip,
  TextField,
  Box,
  Divider
} from "@mui/material";
import { CheckCircle, Close, Inventory, Check, Clear, PendingActions, Cancel, Delete } from "@mui/icons-material";
import { StoreUserBaseType } from "@core/types/store-user";
import { ConfirmDeleteSupplier } from "../ConfirmDeleteSupplier/ConfirmDeleteSupplier";
import { ProductType } from "@core/types/product-item";
import { ProductStatusEnum } from "@core/enums/product-status-enum";

import styles from "./SupplierCard.module.scss";
import { useChangeProductStatus } from "@entities/OfferedProduct";
import { formatRubbles } from "@core/utils/formatRubbles";

interface SupplierCardProps {
    supplier: StoreUserBaseType;
    onProductStatusChange: (productId: number, status: ProductStatusEnum, comment?: string) => void;
};

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductType[];
  onStatusChange: (productId: number, status: ProductStatusEnum, comment?: string) => void;
}

const ProductModal: FC<ProductModalProps> = ({ isOpen, onClose, products, onStatusChange }) => {
  const { changeProductStatus } = useChangeProductStatus()
  const [rejectComment, setRejectComment] = useState<{[key: number]: string}>({});
  const [activeRejectId, setActiveRejectId] = useState<number | null>(null);

  const handleReject = (productId: number) => {
    if (activeRejectId === productId) {
      onStatusChange(productId, ProductStatusEnum.Rejected, rejectComment[productId] || '');
      setActiveRejectId(null);
    } else {
      setActiveRejectId(productId);
    }
  };

  const handleApprove = (productId: number) => {
    onStatusChange(productId, ProductStatusEnum.Accepted);
    setActiveRejectId(null);
  };

  const handleDelete = (productId: number) => {
    changeProductStatus(productId, ProductStatusEnum.Hidden)
  };

  const getStatusChip = (product: ProductType) => {
    switch (product.status) {
      case ProductStatusEnum.Accepted:
        return <Chip label="Принят" color="success" size="small" sx={{ mt: 1 }} />;
      case ProductStatusEnum.Rejected:
        return <Chip label="Отклонен" color="error" size="small" sx={{ mt: 1 }} />;
      case ProductStatusEnum.Moderation:
        return <Chip label="На рассмотрении" color="warning" size="small" sx={{ mt: 1 }} />;
      case ProductStatusEnum.Expired:
        return <Chip label="Удален Вами" color="default" size="small" sx={{ mt: 1 }} />;
      case ProductStatusEnum.Revoked:
        return <Chip label="Отозван поставщиком" color="default" size="small" sx={{ mt: 1 }} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Предложенные продукты</DialogTitle>
      <DialogContent dividers>
        {products?.length === 0 ? (
          <Typography variant="body1" color="textSecondary">
            Нет предложенных продуктов
          </Typography>
        ) : (
          <List>
            {products?.map((product) => (
              <Box key={product.id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar 
                      src={product.image || undefined} 
                      alt={product.name}
                      variant="rounded"
                    >
                      <Inventory />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={product.name}
                    secondary={
                      <>
                        <Typography component="span" display="block">
                          {product.description}
                        </Typography>
                        <Typography component="span" display="block">
                          {formatRubbles(product.offeredPrice)} / {product.unitValue} {product.unitOfMeasurement}
                        </Typography>
                        {product.status === ProductStatusEnum.Expired && (
                          <Typography component="span" display="block" color="text.secondary" fontStyle="italic">
                            Товар был удален Вами
                          </Typography>
                        )}
                        {product.status === ProductStatusEnum.Revoked && (
                          <Typography component="span" display="block" color="text.secondary" fontStyle="italic">
                            Товар был отозван поставщиком
                          </Typography>
                        )}
                        {getStatusChip(product)}
                      </>
                    }
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {product.status === ProductStatusEnum.Moderation ? (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<Check />}
                          onClick={() => handleApprove(product.id)}
                        >
                          Одобрить
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<Clear />}
                          onClick={() => handleReject(product.id)}
                        >
                          {activeRejectId === product.id ? 'Подтвердить' : 'Отклонить'}
                        </Button>
                      </>
                    ) : product.status === ProductStatusEnum.Accepted ? (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<Clear />}
                        onClick={() => handleReject(product.id)}
                      >
                        {activeRejectId === product.id ? 'Подтвердить' : 'Отозвать'}
                      </Button>
                    ) : product.status === ProductStatusEnum.Rejected ? (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<Check />}
                        onClick={() => handleApprove(product.id)}
                      >
                        Принять
                      </Button>
                    ) : product.status === ProductStatusEnum.Revoked ? (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<Delete />}
                        onClick={() => handleDelete(product.id)}
                      >
                        Удалить
                      </Button>
                    ) : null}
                  </Box>
                </ListItem>
                {(activeRejectId === product.id) && (
                  <Box sx={{ p: 2, pt: 0 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Причина отказа"
                      value={rejectComment[product.id] || ''}
                      onChange={(e) => setRejectComment({
                        ...rejectComment,
                        [product.id]: e.target.value
                      })}
                      placeholder="Укажите причину отказа..."
                    />
                  </Box>
                )}
                <Divider sx={{ my: 1 }} />
              </Box>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const SupplierCard: FC<SupplierCardProps> = (props) => {
    const { supplier, onProductStatusChange } = props;

    const { email, products } = supplier;

    const [isOpenConfirmDeleteModal, setIsOpenConfirmDeleteModal] = useState<boolean>(false);
    const [isOpenProductsModal, setIsOpenProductsModal] = useState<boolean>(false);

    const productStats = {
        accepted: products?.filter(
            (product) => product.status === ProductStatusEnum.Accepted
        ).length || 0,
        pending: products?.filter(
            (product) => product.status === ProductStatusEnum.Moderation
        ).length || 0,
        rejected: products?.filter(
            (product) => product.status === ProductStatusEnum.Rejected
        ).length || 0,
        revoked: products?.filter(
            (product) => product.status === ProductStatusEnum.Revoked
        ).length || 0
    };

    return (
        <>
            <ConfirmDeleteSupplier
                supplier={supplier}
                isOpen={isOpenConfirmDeleteModal}
                onClose={() => setIsOpenConfirmDeleteModal(false)}
            />
            <ProductModal
                isOpen={isOpenProductsModal}
                onClose={() => setIsOpenProductsModal(false)}
                products={products || []}
                onStatusChange={onProductStatusChange}
            />
            <div 
                className={styles.card} 
                onClick={() => setIsOpenProductsModal(true)}
                style={{ cursor: 'pointer' }}
            >
                {productStats.pending > 0 && (
                    <Badge
                        badgeContent={productStats.pending}
                        color="error"
                        className={styles.badge}
                        overlap="circular"
                    />
                )}

                <div className={styles.header}>
                    <div className={styles.email}>{email}</div>
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpenConfirmDeleteModal(true);
                        }}
                        className={styles.deleteBtn}
                        startIcon={<Close />}
                        size="small"
                    >
                        Удалить
                    </Button>
                </div>

                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <CheckCircle color="success" fontSize="small" />
                        <span>Подтверждено: {productStats.accepted}</span>
                    </div>
                    <div className={styles.statItem}>
                        <PendingActions color="warning" fontSize="small" />
                        <span>На рассмотрении: {productStats.pending}</span>
                    </div>
                    {productStats.rejected > 0 && (
                        <div className={styles.statItem}>
                            <Cancel color="error" fontSize="small" />
                            <span>Отклонено: {productStats.rejected}</span>
                        </div>
                    )}
                    {productStats.revoked > 0 && (
                        <div className={styles.statItem}>
                            <Cancel color="error" fontSize="small" />
                            <span>Удалено поставщиком: {productStats.revoked}</span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};