export interface ApiEnvelope<TData> {
  data: TData;
  meta?: Record<string, unknown>;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}
