export enum OrderStatusEnum  {
    Created = 'created', // Создан
    Confirmed = 'confirmed', // Подтвержден
    WaitForPay = 'waitForPay', // Ожилает оплаты
    Assembly = 'assembly', // Готовится к отправке
    ReadyForDelivery = 'readyForDelivery', // Готов к отправке
    TransferredToDelivery = 'transferredToDelivery', // Передан курьеру
    OnTheWay = 'onTheWay', // В пути
    CanceledByUser = 'canceled_by_user', // Отменен пользователем
    CancelByAdmin = 'cancel_by_admin', // Отменен магазином
    Finished = 'finished', // Завершен
    FinishedAndRated = 'finished_and_rated' // Завершен и оценен
}
