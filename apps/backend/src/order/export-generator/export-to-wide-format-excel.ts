import { OrderEntity } from '@core/entities/order.entity';
import { ProductEntity } from '@core/entities/product.entity';
import * as XLSX from 'xlsx';

interface TableExportOptions {
    products: ProductEntity[];
    orders: OrderEntity[];
}

export const exportToWideFormatExcel = (options: TableExportOptions): Uint8Array => {
    const { products, orders } = options;

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
    orders.forEach((order) => {
        // Создаем маппинг товаров в заказе для быстрого доступа
        const orderedProductsMap = new Map(
            order.ordered_products.map(op => [op.product.id, op.quantity])
        );

        const rowData = [
            order.id,
            order.fullAddress,
            order.pickupPoint?.name || 'Не указан',
            1, // Приоритет
            order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("ru-RU") : 'Не указана',
            order.deliveryTime ? `${order.deliveryTime.startTime} - ${order.deliveryTime.endTime}` : 'Не указано',
            order.phoneNumber,
            order.comment || 'Нет комментария',
            order.totalAmount + ' ₽',
            order.status || 'Ожидает оплаты',
            // Добавляем количество для каждого товара
            ...products.map(product => 
                orderedProductsMap.get(product.id) || '-'
            )
        ];
        excelData.push(rowData);
    });

    // Итоговая строка
    const totalsRow = [
        'Итого:', '', '', '', '', '', '', '',
        `${orders.reduce((acc, order) => acc + (Number(order.totalAmount) || 0), 0)} ₽`,
        '',
        // Итоги по товарам
        ...products.map(product => {
            const total = orders.reduce((sum, order) => {
                const op = order.ordered_products.find(p => p.product.id === product.id);
                return sum + (op ? op.quantity : 0);
            }, 0);
            return total > 0 ? total : '-';
        })
    ];
    excelData.push(totalsRow);

    // Добавляем данные в лист
    XLSX.utils.sheet_add_aoa(worksheet, excelData, { origin: 'A1' });

    // Настройка ширины колонок
    worksheet['!cols'] = [
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
        ...products.map(() => ({ wch: 10 })) // Товары
    ];

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

    XLSX.utils.book_append_sheet(workbook, worksheet, "Заказы");

    // Возвращаем buffer вместо сохранения файла
    return XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array' 
    });
};