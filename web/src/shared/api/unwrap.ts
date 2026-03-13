import type { AxiosResponse } from "axios";
import type { ApiEnvelope, ApiSuccess } from "@/shared/types/api";

export function unwrap<T>(response: AxiosResponse<ApiEnvelope<T>>): T {
  const body = response.data;
  if (!body.success) {
    throw Object.assign(new Error(body.message), { statusCode: response.status, code: body.error, details: body.details, requestId: body.requestId });
  }
  return (body as ApiSuccess<T>).data;
}
