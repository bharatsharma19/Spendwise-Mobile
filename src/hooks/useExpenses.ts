import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { expenseApi } from "../api/expense.api";
import {
  CreateExpenseDto,
  Expense,
  ExpenseFilters,
  UpdateExpenseDto,
} from "../types";

export function useExpenses(filters?: ExpenseFilters) {
  return useQuery({
    queryKey: ["expenses", filters],
    queryFn: () => expenseApi.getExpenses(filters),
  });
}

export function useExpense(id: string) {
  return useQuery({
    queryKey: ["expense", id],
    queryFn: () => expenseApi.getExpense(id),
    enabled: !!id,
  });
}

export function useExpenseSummary(params?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ["expenseSummary", params],
    queryFn: () => expenseApi.getSummary(params),
  });
}

export function useCategoryStats(params?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ["categoryStats", params],
    queryFn: () => expenseApi.getCategoryStats(params),
  });
}

export function useExpenseTrends(interval?: "daily" | "weekly" | "monthly") {
  return useQuery({
    queryKey: ["expenseTrends", interval],
    queryFn: () => expenseApi.getTrends(interval),
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseDto) => expenseApi.createExpense(data),
    onMutate: async (newExpense) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["expenses"] });

      // Snapshot previous value
      const previousExpenses = queryClient.getQueryData<Expense[]>([
        "expenses",
      ]);

      // Optimistically update
      if (previousExpenses) {
        const optimisticExpense: Expense = {
          id: `temp-${Date.now()}`,
          userId: "",
          amount: newExpense.amount,
          currency: newExpense.currency || "INR",
          category: newExpense.category,
          description: newExpense.description || "",
          date: newExpense.date,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isRecurring: newExpense.isRecurring || false,
          isSplit: newExpense.isSplit || false,
        };
        queryClient.setQueryData<Expense[]>(
          ["expenses"],
          [optimisticExpense, ...previousExpenses],
        );
      }

      return { previousExpenses };
    },
    onError: (_err, _newExpense, context) => {
      // Rollback on error
      if (context?.previousExpenses) {
        queryClient.setQueryData(["expenses"], context.previousExpenses);
      }
    },
    onSettled: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenseSummary"] });
      queryClient.invalidateQueries({ queryKey: ["categoryStats"] });
      queryClient.invalidateQueries({ queryKey: ["expenseTrends"] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseDto }) =>
      expenseApi.updateExpense(id, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenseSummary"] });
      queryClient.invalidateQueries({ queryKey: ["categoryStats"] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expenseApi.deleteExpense(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["expenses"] });
      const previousExpenses = queryClient.getQueryData<Expense[]>([
        "expenses",
      ]);

      if (previousExpenses) {
        queryClient.setQueryData<Expense[]>(
          ["expenses"],
          previousExpenses.filter((e) => e.id !== id),
        );
      }

      return { previousExpenses };
    },
    onError: (_err, _id, context) => {
      if (context?.previousExpenses) {
        queryClient.setQueryData(["expenses"], context.previousExpenses);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenseSummary"] });
      queryClient.invalidateQueries({ queryKey: ["categoryStats"] });
    },
  });
}
