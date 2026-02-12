// Generic API response wrapper matching backend { status, data } format
export interface ApiResponse<T> {
  status: "success" | "error";
  data: T;
  message?: string;
}

export interface ApiError {
  status: "error";
  message: string;
  errors?: { field: string; message: string }[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}
