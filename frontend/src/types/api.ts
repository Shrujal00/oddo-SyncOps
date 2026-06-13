export interface ApiResponse<TData> {
  data: TData;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
