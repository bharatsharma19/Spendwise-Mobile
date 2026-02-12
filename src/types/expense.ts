export type ExpenseCategory =
  | "food"
  | "transportation"
  | "housing"
  | "utilities"
  | "entertainment"
  | "healthcare"
  | "shopping"
  | "education"
  | "other";

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  description: string;
  date: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  tags?: string[];
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
  isRecurring: boolean;
  recurringDetails?: {
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    nextDueDate: string;
    endDate?: string;
  };
  isSplit: boolean;
  splitDetails?: {
    splits: {
      userId: string;
      amount: number;
      status: "pending" | "paid" | "cancelled";
      paidAt?: string;
    }[];
    totalSplits: number;
    paidSplits: number;
    splitAmount: number;
  };
}

export interface CreateExpenseDto {
  amount: number;
  category: ExpenseCategory;
  description?: string;
  date: string; // ISO string
  currency?: string;
  isRecurring?: boolean;
  recurringFrequency?: "daily" | "weekly" | "monthly" | "yearly";
  isSplit?: boolean;
  splitWith?: string[];
  splitAmount?: number;
  tags?: string[];
  receiptUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export type UpdateExpenseDto = Partial<CreateExpenseDto>;

export interface ExpenseSummary {
  total: number;
  count: number;
  average: number;
  min: number;
  max: number;
}

export interface CategoryStat {
  total: number;
  count: number;
  average: number;
  percentage: number;
}

export type CategoryStats = Record<string, CategoryStat>;

export interface ExpenseTrends {
  total: number;
  count: number;
  byCategory: Record<string, { total: number; count: number }>;
  byDate: Record<string, { total: number; count: number }>;
}

export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  category?: ExpenseCategory;
  isRecurring?: boolean;
}

export const EXPENSE_CATEGORIES: {
  value: ExpenseCategory;
  label: string;
  icon: string;
  color: string;
}[] = [
  { value: "food", label: "Food", icon: "restaurant", color: "#f97316" },
  {
    value: "transportation",
    label: "Transport",
    icon: "directions-car",
    color: "#3b82f6",
  },
  { value: "housing", label: "Housing", icon: "home", color: "#8b5cf6" },
  { value: "utilities", label: "Utilities", icon: "bolt", color: "#eab308" },
  {
    value: "entertainment",
    label: "Entertainment",
    icon: "movie",
    color: "#ec4899",
  },
  {
    value: "healthcare",
    label: "Healthcare",
    icon: "local-hospital",
    color: "#ef4444",
  },
  {
    value: "shopping",
    label: "Shopping",
    icon: "shopping-bag",
    color: "#14b8a6",
  },
  { value: "education", label: "Education", icon: "school", color: "#6366f1" },
  { value: "other", label: "Other", icon: "more-horiz", color: "#6b7280" },
];
