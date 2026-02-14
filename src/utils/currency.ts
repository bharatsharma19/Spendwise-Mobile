export const getCurrencySymbol = (currencyCode: string): string => {
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
      maximumFractionDigits: 0, // Simplified for now
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount}`;
  }
};
