import { OrderEntity } from "src/entities/order.entity";

export const cancelOrderByUserMessage = (order: OrderEntity) => {
    return `
        ✖️ <b>Заказ #${order.id} отменён</b> 😔

        ❓ Если это произошло по ошибке или у вас есть вопросы, 
        напишите нам @leninskiyprospekt_fruit_express 👨‍💻

        Будем рады видеть вас снова! 🛒💖
    `.trim();
}