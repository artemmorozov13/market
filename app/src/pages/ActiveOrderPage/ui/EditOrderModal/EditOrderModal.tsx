import { FC, useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { useUpdateOrder } from "../../api/useUpdateOrder";
import styles from "./EditOrderModal.module.scss";
import { Order } from "../../types/activeOrderTypes";

interface EditOrderModalProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
}

export const EditOrderModal: FC<EditOrderModalProps> = ({
  open,
  onClose,
  order,
}) => {
  const { mutate: updateOrder } = useUpdateOrder();
  const [formData, setFormData] = useState<Partial<Order>>({});

  useEffect(() => {
    if (order) {
      setFormData({
        id: order.id,
        address: order.address,
        phoneNumber: order.phoneNumber,
        comment: order.comment,
        deliveryDate: order.deliveryDate,
      });
    }
  }, [order]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    updateOrder(formData);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} > 
      <Box className={styles.modal}>
        <Typography variant="h6" className={styles.title}>
          Редактирование заказа
        </Typography>

        <Stack spacing={2} className={styles.form}>
          <TextField
            label="Адрес доставки"
            name="address"
            value={formData.address || ""}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Телефон"
            name="phoneNumber"
            value={formData.phoneNumber || ""}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Дата доставки"
            name="deliveryDate"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.deliveryDate || ""}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Комментарий"
            name="comment"
            value={formData.comment || ""}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
          />

          <Stack direction="row" spacing={2} className={styles.buttons}>
            <Button variant="outlined" onClick={onClose} fullWidth>
              Отмена
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              fullWidth
            >
              Сохранить
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};