import { OrderFormInputs } from "@/features/OrderForm/types/orderFormTypes";
import { DeliveryStrategyEnum } from "@core/enums/delivery-strategy.enum";

export const adaptOrderFormToDto = (formData: OrderFormInputs) => {
  // Базовые поля для всех заказов
  const baseDto = {
    phone: formData.phone,
    comment: formData.comment || '',
    storeId: formData.storeId,
    deliveryMethod: formData.deliveryMethod,
    deliveryStrategy: formData.deliveryMethod,
    deliveryDate: formData.deliveryDate || new Date().toISOString(),
  };

  // Для заказов с доставкой
  if (formData.deliveryMethod === DeliveryStrategyEnum.DeliveryToEntrance) {
    if (!formData.address || !formData.address.fullAddress) {
      throw new Error('Для доставки необходимо указать полный адрес');
    }

    const deliveryDto = {
      phone: baseDto.phone,
      comment: baseDto.comment,
      storeId: baseDto.storeId,
      deliveryMethod: baseDto.deliveryMethod,
      deliveryStrategy: baseDto.deliveryStrategy,
      deliveryDate: baseDto.deliveryDate,
      deliveryAreaId: formData.deliveryAreaId || 0,
      deliveryTimeId: formData.deliveryTimeId || 0,
      addressId: formData.addressId || formData.address.id || '',
      address: {
        id: formData.address.id || '',
        fullAddress: formData.address.fullAddress,
        latitude: formData.address.latitude,
        longitude: formData.address.longitude,
        entrance: formData.address.entrance || '',
        floor: formData.address.floor || '',
        apartment: formData.address.apartment || '',
        comment: formData.address.comment || ''
      },
      pickupPointId: undefined // Явно убираем поле для самовывоза
    };

    return deliveryDto;
  }

  // Для заказов с самовывозом
  const pickupDto = {
    phone: baseDto.phone,
    comment: baseDto.comment,
    storeId: baseDto.storeId,
    deliveryMethod: baseDto.deliveryMethod,
    deliveryStrategy: baseDto.deliveryStrategy,
    deliveryDate: baseDto.deliveryDate,
    pickupPointId: formData.pickupPointId || 0,
    deliveryAreaId: undefined, // Явно убираем поля для доставки
    deliveryTimeId: undefined,
    addressId: undefined,
    address: undefined
  };

  return pickupDto;
};