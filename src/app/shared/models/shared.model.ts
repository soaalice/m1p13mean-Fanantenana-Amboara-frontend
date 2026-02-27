export interface PageResult<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T[];
}

export interface ApiSingleResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface SelectItem {
  id: string;
  label: string;
}
