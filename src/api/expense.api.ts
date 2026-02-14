import {
  ApiResponse,
  CategoryStats,
  CreateExpenseDto,
  Expense,
  ExpenseFilters,
  ExpenseSummary,
  ExpenseTrends,
  PaginatedApiResponse,
  PaginationParams,
  UpdateExpenseDto,
} from "../types";
import apiClient from "./axios";

export const expenseApi = {
  getExpenses: async (filters?: ExpenseFilters): Promise<Expense[]> => {
    const params: Record<string, string> = {};
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    if (filters?.category) params.category = filters.category;
    if (filters?.isRecurring !== undefined)
      params.isRecurring = String(filters.isRecurring);

    const response = await apiClient.get<ApiResponse<Expense[]>>("/expenses", {
      params,
    });
    return response.data.data;
  },

  getExpensesPaginated: async (
    filters?: ExpenseFilters,
    pagination?: PaginationParams,
  ): Promise<PaginatedApiResponse<Expense>> => {
    const params: Record<string, string> = {};
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    if (filters?.category) params.category = filters.category;
    if (filters?.isRecurring !== undefined)
      params.isRecurring = String(filters.isRecurring);
    if (pagination?.page) params.page = String(pagination.page);
    if (pagination?.limit) params.limit = String(pagination.limit);

    const response = await apiClient.get<PaginatedApiResponse<Expense>>(
      "/expenses",
      { params },
    );
    return response.data;
  },

  getExpense: async (id: string): Promise<Expense> => {
    const response = await apiClient.get<ApiResponse<Expense>>(
      `/expenses/${id}`,
    );
    return response.data.data;
  },

  createExpense: async (data: CreateExpenseDto): Promise<Expense> => {
    const response = await apiClient.post<ApiResponse<Expense>>(
      "/expenses",
      data,
    );
    return response.data.data;
  },

  updateExpense: async (
    id: string,
    data: UpdateExpenseDto,
  ): Promise<Expense> => {
    const response = await apiClient.put<ApiResponse<Expense>>(
      `/expenses/${id}`,
      data,
    );
    return response.data.data;
  },

  deleteExpense: async (id: string): Promise<void> => {
    await apiClient.delete(`/expenses/${id}`);
  },

  getSummary: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ExpenseSummary> => {
    const response = await apiClient.get<ApiResponse<ExpenseSummary>>(
      "/expenses/stats/summary",
      { params },
    );
    return response.data.data;
  },

  getCategoryStats: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<CategoryStats> => {
    const response = await apiClient.get<ApiResponse<CategoryStats>>(
      "/expenses/stats/categories",
      { params },
    );
    return response.data.data;
  },

  getTrends: async (
    interval?: "daily" | "weekly" | "monthly",
  ): Promise<ExpenseTrends> => {
    const response = await apiClient.get<ApiResponse<ExpenseTrends>>(
      "/expenses/stats/trends",
      {
        params: interval ? { interval } : undefined,
      },
    );
    return response.data.data;
  },
};
