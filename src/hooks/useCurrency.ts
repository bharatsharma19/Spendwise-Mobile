import { useAuthStore } from "@/src/store/auth.store";
import { useCallback } from "react";
import { formatCurrencyAmount, getCurrencySymbol } from "../utils/currency";

export const useCurrency = () => {
  const { user } = useAuthStore();
  const currencyCode = user?.preferences?.currency || "INR";

  const formatCurrency = useCallback(
    (amount: number, currency?: string) => {
      return formatCurrencyAmount(amount, currency || currencyCode);
    },
    [currencyCode],
  );

  const currencySymbol = getCurrencySymbol(currencyCode);

  return {
    currencyCode,
    currencySymbol,
    formatCurrency,
  };
};
