const intl = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

export const formatRubbles = (number?: number | string) => {
    const transformNumber = Number(number);

    if (Number.isNaN(transformNumber)) {
        return 0;
    }

    return intl.format(transformNumber);
}