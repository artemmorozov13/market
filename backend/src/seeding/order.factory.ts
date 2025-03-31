import { OrderEntity } from "../entities/order.entity";
import { setSeederFactory } from "typeorm-extension";
import { faker } from "@faker-js/faker";

export const OrderFactory = setSeederFactory(OrderEntity, () => {
    const order = new OrderEntity();

    order.status = faker.helpers.arrayElement(["waitForPay", "payConfirm", "finished"]);
    order.created_at = faker.date.past();
    order.updated_at = new Date();

    return order;
});