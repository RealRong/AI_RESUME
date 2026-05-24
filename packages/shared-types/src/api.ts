export type ApiError = {
  code: string;
  message: string;
};

export type ApiMeta = {
  requestId?: string;
  page?: number;
  pageSize?: number;
  total?: number;
};

export type ApiResponse<T> = {
  data: T;
  meta: ApiMeta;
  error: ApiError | null;
};
