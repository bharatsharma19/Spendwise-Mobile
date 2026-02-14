// Generic API response wrapper matching backend { status, data } format
export interface ApiResponse<T> {
  status: "success" | "error";
  data: T;
  message?: string;
}

export interface PaginatedApiResponse<T> {
  status: "success" | "error";
  data: T[];
  pagination: {
    totalCount: number;
    page: number;
    totalPages: number;
    hasNextPage: boolean;
  };
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
