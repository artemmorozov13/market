import { API } from "@shared/api/instance";

export const exportOrdersWithInnerTable = async (selectedPickupPoints: number[]) => {
    try {
      const response = await API.post(
        `/order/export-inner-table`,
        {},
        {
          responseType: 'blob',
          params: {
            pickupPointIds: selectedPickupPoints?.join(',')
          }
        }
      );
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `заказы_ожидающие_оплаты_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка при экспорте:', error);
      alert('Не удалось экспортировать данные');
    }
  };