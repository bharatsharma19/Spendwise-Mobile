const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
  CHF: "Fr",
  CNY: "¥",
  NZD: "NZ$",
};

export const getCurrencySymbol = (currencyCode: string): string => {
  if (CURRENCY_SYMBOLS[currencyCode]) {
    return CURRENCY_SYMBOLS[currencyCode];
  }

  try {
    const locale = currencyCode === "INR" ? "en-IN" : "en-US";
    return (
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
      })
        .formatToParts(0)
        .find((part) => part.type === "currency")?.value || currencyCode
    );
  } catch {
    return currencyCode;
  }
};

export const formatCurrencyAmount = (
  amount: number,
  currencyCode: string,
): string => {
  try {
    const locale = currencyCode === "INR" ? "en-IN" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
};
