export interface GroupMember {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  role: "admin" | "member";
  joinedAt: string;
}

export interface GroupExpense {
  id: string;
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: string;
  paidBy: string;
  splits: {
    userId: string;
    amount: number;
    status: "pending" | "paid";
    paidAt?: string;
  }[];
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  currency: string;
  code: string;
  createdBy: string;
  status: "active" | "archived";
  totalExpenses: number;
  totalMembers: number;
  members: GroupMember[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupAnalyticsResponse {
  totalExpenses: number;
  totalSettlements: number;
  memberBalances: Record<string, number>;
  expenseByCategory: Record<string, number>;
}
