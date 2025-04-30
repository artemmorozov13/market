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
    
    // Фильтруем заказы, оставляем только с статусом waitForPay
    const filteredOrders = tableOrders.filter(order => order.status === StatusEnum.WaitForPay);

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

    // Данные заказов (только waitForPay)
    filteredOrders.forEach((order) => {
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
        'Ожидает оплаты', // Явно указываем статус
        // Добавляем количество для каждого товара
        ...order.ordered_products.map(product => 
          product.quantity > 0 ? product.quantity : '-'
        )
      ];
      excelData.push(rowData);
    });

    // Итоговая строка с суммой товаров (только по отфильтрованным заказам)
    const totalsRow = [
      'Итого:', '', '', '', '', '', '', '',
      `${filteredOrders.reduce((acc, order) => (acc + Number(order.totalAmount)), 0)} ₽`,
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

    XLSX.utils.book_append_sheet(workbook, worksheet, "Заказы_ожидающие_оплаты");

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    saveAs(data, `заказы_ожидающие_оплаты_широкий_формат_${new Date().toLocaleDateString()}.xlsx`);
};