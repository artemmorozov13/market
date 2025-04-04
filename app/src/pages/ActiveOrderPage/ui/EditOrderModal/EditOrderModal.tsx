import { API } from "@/shared/api/API";
import { Button, Modal, TextField, Typography } from "@mui/material";
import { FC, useState } from "react";
import styles from "./EditOrderModal.module.scss"

export const EditOrderModal: FC<any> = ({ open, onClose, order, refreshOrders }) => {
    const [form, setForm] = useState(order || {});
  
    const handleChange = (e: any) => {
      setForm({ ...form, [e.target.name]: e.target.value });
    };
  
    const handleSubmit = async () => {
      await API.post("/order/update-order", form);
      refreshOrders();
      onClose();
    };
  
    return (
      <Modal open={open} onClose={onClose}>
        <div className={styles.modalContent}>
          <Typography variant="h6">Редактирование заказа</Typography>
          <TextField label="Адрес" name="address" value={form.address} onChange={handleChange} fullWidth />
          <TextField label="Телефон" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} fullWidth />
          <Button onClick={handleSubmit} variant="contained" color="primary">Сохранить</Button>
        </div>
      </Modal>
    );
  };