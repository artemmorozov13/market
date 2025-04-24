import * as XLSX from 'xlsx';
import { TableOrder } from './adaptOrdersToTable';
import { StatusEnum } from '@entities/Order';
import { ProductType } from '@entities/Product';
import { saveAs } from 'file-saver';

interface TableExportOptions {
    products: ProductType[]
    tableOrders: TableOrder[]
}

export const exportToWideFormatExcel = (options: TableExportOptions) => {
    const { products, tableOrders } = options
    
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([]);

    const excelData: any[][] = [];

    // Заголовки
    const headers = [
      '№ заказа', 
      'Адрес', 
      'Пункт выдачи', 
      'Приоритет', 
      'Дата доставки',
      'Время доставки', 
      'Телефон',
      'Комментарий',
      'Сумма',
      'Статус',
      // Добавляем заголовки для всех товаров
      ...products.map(p => p.name)
    ];
    excelData.push(headers);

    // Данные заказов
    tableOrders.forEach((order) => {
      const rowData = [
        order.id,
        order.fullAddress,
        order.pickupPointName || 'Не указан',
        order.priority,
        order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("Ru-ru") : 'Не указана',
        order.deliveryTimeRange || 'Не указано',
        order.phone,
        order.comment || 'Нет комментария',
        order.totalAmount + ' ₽',
        order.status === StatusEnum.Finished ? 'Завершен' : 'Оплачено',
        // Добавляем количество для каждого товара
        ...products.map(product => 
          order.products[product.id] > 0 ? order.products[product.id] : '-'
        )
      ];
      excelData.push(rowData);
    });
    // Итоговая строка с суммой товаров
    const totalsRow = [
      'Итого', '', '', '', '', '', '', '', '',
      tableOrders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2) + ' ₽',
      ...products.map(product => 
        tableOrders.reduce((sum, order) => sum + (order.products[product.id] || 0), 0)
      )
    ];
    excelData.push(totalsRow);

    XLSX.utils.sheet_add_aoa(worksheet, excelData, { origin: 'A1' });

    // Настройка ширины колонок
    const colWidths = [
      { wch: 10 },  // № заказа
      { wch: 30 },  // Адрес
      { wch: 20 },  // Пункт выдачи
      { wch: 10 },  // Приоритет
      { wch: 15 },  // Дата доставки
      { wch: 15 },  // Время доставки
      { wch: 15 },  // Телефон
      { wch: 30 },  // Комментарий
      { wch: 15 },  // Сумма
      { wch: 15 },  // Статус
      // Ширина для товаров
      ...products.map(() => ({ wch: 10 }))
    ];
    worksheet['!cols'] = colWidths;

    // Центрирование ячеек
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = { 
            alignment: { 
              horizontal: 'center', 
              vertical: 'center' 
            } 
          };
        }
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, "Заказы_широкий_формат");

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    saveAs(data, `заказы_широкий_формат_${new Date().toLocaleDateString()}.xlsx`);
  };