export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: string;
  message: string;
  requestId?: string;
  details?: unknown;
};

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export type NormalizedApiError = {
  status: number;
  code: string;
  message: string;
  requestId?: string;
  details?: unknown;
  raw?: unknown;
};
