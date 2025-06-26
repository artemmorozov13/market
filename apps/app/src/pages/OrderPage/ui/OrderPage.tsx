import { FC } from 'react';
import styles from './OrderPage.module.scss';
import { Layout } from '@/widgets/Layout';
import { observer } from 'mobx-react-lite';
import { Container } from '@/shared/ui/Container';
import { OrderForm, orderFormStore } from '@/features/OrderForm';
import { OrderFormInputs } from '@/features/OrderForm/types/orderFormTypes';
import { RoutePath } from '@/shared/routes/routeConfig';
import { CreateOrderOptions, createOrder } from '@/entities/Order/api/createOrder';
import { useNavigate } from 'react-router';

const OrderPage: FC = observer(() => {
    const navigate = useNavigate()
    const { setComplitedForm } = orderFormStore;
  
    const handleCreateOrder = (formData: OrderFormInputs) => {  
      setComplitedForm(formData);
  
      const options: CreateOrderOptions = {
        data: formData,
      };
      createOrder(options)
        .then(() => {
          navigate(RoutePath.products);
        })
    };
  
    return (
      <Layout className={styles.wrapper}>
        <Container className={styles.container}>
          <OrderForm onSubmit={handleCreateOrder} />
        </Container>
      </Layout>
    );
});

export default OrderPage