import * as XLSX from 'xlsx';
import { TableOrder } from './adaptOrdersToTable';
import { StatusEnum } from '@entities/Order';
import { ProductType } from '@entities/Product';
import { saveAs } from 'file-saver';

interface TableExportOptions {
    tableOrders: TableOrder[]
}

export const exportToExcel = (options: TableExportOptions) => {
    const { tableOrders } = options

    const filteredOrders = tableOrders.filter(order => order.status === StatusEnum.WaitForPay);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([]);

    const excelData: any[][] = [];

    // Заголовки
    excelData.push([
      '№ заказа', 
      'Адрес', 
      'Пункт выдачи', 
      'Приоритет', 
      'Дата доставки',
      'Время доставки', 
      'Телефон',
      'Комментарий',
      'Сумма',
      'Статус'
    ]);

    // Данные заказов (только waitForPay)
    filteredOrders.forEach((order) => {
      excelData.push([
        order.id,
        order.fullAddress,
        order.pickupPointName || 'Не указан',
        order.priority,
        order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("Ru-ru") : 'Не указана',
        order.deliveryTimeRange || 'Не указано',
        order.phone,
        order.comment || 'Нет комментария',
        order.totalAmount + ' ₽',
        'Ожидает оплаты' // Так как мы фильтровали по waitForPay, можно явно указать статус
      ]);

      // Товары в заказе
      excelData.push([]);
      excelData.push(['', 'Товары в заказе:']);
      excelData.push(['', 'Наименование', 'Цена', 'Количество', 'Скидка', 'Сумма']);

      order.ordered_products.forEach(product => {
        excelData.push([
          '',
          product.product.name,
          product.product.price + ' ₽',
          product.quantity,
          product.product.discount + '%',
          product.quantity * Number(product.product.price),
        ])
      });

      excelData.push([]);
    });

    XLSX.utils.sheet_add_aoa(worksheet, excelData, { origin: 'A1' });

    worksheet['!cols'] = [
      { wch: 10 },
      { wch: 30 },
      { wch: 20 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 }
    ];

    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = { alignment: { horizontal: 'center', vertical: 'center' } };
        }
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, "Заказы");

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    saveAs(data, `заказы_ожидающие_оплаты_${new Date().toLocaleDateString()}.xlsx`);
  };