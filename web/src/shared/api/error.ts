import { AxiosError } from "axios";
import type { ApiFailure, NormalizedApiError } from "@/shared/types/api";

export type AppError = NormalizedApiError & {
  type: "VALIDATION_ERROR" | "RATE_LIMITED" | "NETWORK_ERROR" | "TIMEOUT" | "PARSE_ERROR" | "UNKNOWN_ERROR";
  message: string;
  statusCode?: number;
  fieldErrors?: Record<string, string[]>;
  retryAfter?: number;
  originalError?: unknown;
};

export function normalizeApiError(error: unknown): AppError {
  if (error instanceof AxiosError) {
    const status = error.response?.status || 0;
    const parsedData = parseErrorData(error.response?.data);
    if (parsedData.type === "PARSE_ERROR") {
      // TODO: integrate Sentry.captureException() here
      return {
        status: 0,
        code: "PARSE_ERROR",
        type: "PARSE_ERROR",
        statusCode: undefined,
        message: "Failed to parse server response.",
        originalError: parsedData.error,
        raw: error.response?.data
      };
    }

    const data = parsedData.data as ApiFailure | undefined;
    const requestId = data?.requestId || (error.response?.headers?.["x-request-id"] as string | undefined);
    const details = data?.details;

    if (!error.response) {
      // TODO: integrate Sentry.captureException() here
      return {
        status: 0,
        code: "NETWORK_ERROR",
        type: "NETWORK_ERROR",
        statusCode: undefined,
        message: "No internet connection. Please check your network.",
        requestId,
        details,
        originalError: error,
        raw: error
      };
    }

    if (error.code === "ECONNABORTED") {
      // TODO: integrate Sentry.captureException() here
      return {
        status,
        code: "TIMEOUT",
        type: "TIMEOUT",
        statusCode: status || undefined,
        message: "Request timed out. Please try again.",
        requestId,
        details,
        originalError: error,
        raw: error.response?.data
      };
    }

    if (status === 422) {
      // TODO: integrate Sentry.captureException() here
      return {
        status,
        code: "VALIDATION_ERROR",
        type: "VALIDATION_ERROR",
        statusCode: status,
        message: "Please check your input.",
        fieldErrors: extractFieldErrors(error.response?.data),
        requestId,
        details,
        originalError: error,
        raw: error.response?.data
      };
    }

    if (status === 429) {
      const retryAfter = parseRetryAfter(error.response?.headers?.["retry-after"]);
      // TODO: integrate Sentry.captureException() here
      return {
        status,
        code: "RATE_LIMITED",
        type: "RATE_LIMITED",
        statusCode: status,
        message: "Too many requests. Please wait and try again.",
        retryAfter,
        requestId,
        details,
        originalError: error,
        raw: error.response?.data
      };
    }

    // TODO: integrate Sentry.captureException() here
    return {
      status,
      code: data?.error || error.code || "UNKNOWN_ERROR",
      type: "UNKNOWN_ERROR",
      statusCode: status || undefined,
      message: data?.message || error.message || "Request failed",
      requestId,
      details,
      originalError: error,
      raw: error.response?.data
    };
  }

  if (error instanceof SyntaxError) {
    // TODO: integrate Sentry.captureException() here
    return {
      status: 0,
      code: "PARSE_ERROR",
      type: "PARSE_ERROR",
      message: "Failed to parse server response.",
      statusCode: undefined,
      originalError: error,
      raw: error
    };
  }

  const fallback = error as { message?: string } | undefined;
  // TODO: integrate Sentry.captureException() here
  return {
    status: 0,
    code: "UNKNOWN_ERROR",
    type: "UNKNOWN_ERROR",
    message: fallback?.message || "Request failed",
    statusCode: undefined,
    originalError: error,
    raw: error
  };
}

function parseErrorData(raw: unknown): { type: "OK"; data: unknown } | { type: "PARSE_ERROR"; error: unknown } {
  if (typeof raw !== "string") {
    return { type: "OK", data: raw };
  }
  try {
    return { type: "OK", data: JSON.parse(raw) };
  } catch (parseError) {
    return { type: "PARSE_ERROR", error: parseError };
  }
}

function extractFieldErrors(data: unknown): Record<string, string[]> {
  const source = asRecord(data);
  const raw = source?.errors ?? source?.details;
  const rawMap = asRecord(raw);
  if (!rawMap) return {};

  const fieldErrors: Record<string, string[]> = {};
  for (const [field, value] of Object.entries(rawMap)) {
    if (Array.isArray(value)) {
      fieldErrors[field] = value.map((item) => String(item));
      continue;
    }
    if (typeof value === "string") {
      fieldErrors[field] = [value];
    }
  }
  return fieldErrors;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function parseRetryAfter(value: unknown): number | undefined {
  if (Array.isArray(value)) {
    return parseRetryAfter(value[0]);
  }
  if (typeof value !== "string") {
    return undefined;
  }
  const asNumber = Number(value);
  return Number.isFinite(asNumber) ? asNumber : undefined;
}
