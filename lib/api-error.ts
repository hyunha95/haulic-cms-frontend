import axios from "axios"

import type { ApiErrorResponse, ApiFieldError } from "@/lib/types"

export class ApiRequestError extends Error {
  code: string
  fieldErrors: ApiFieldError[]
  status?: number

  constructor(params: { code: string; message: string; fieldErrors?: ApiFieldError[]; status?: number }) {
    super(params.message)
    this.name = "ApiRequestError"
    this.code = params.code
    this.fieldErrors = params.fieldErrors ?? []
    this.status = params.status
  }
}

export function normalizeApiError(
  error: unknown,
  fallbackMessage = "요청 처리 중 오류가 발생했습니다.",
): ApiRequestError {
  if (error instanceof ApiRequestError) {
    return error
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as {
      response?: {
        status?: number
        data?: unknown
      }
    }
    const status = axiosError.response?.status
    const data = axiosError.response?.data as ApiErrorResponse | undefined

    return new ApiRequestError({
      code: data?.code ?? `HTTP_${status ?? "ERROR"}`,
      message: data?.message ?? fallbackMessage,
      fieldErrors: Array.isArray(data?.fieldErrors) ? data.fieldErrors : [],
      status,
    })
  }

  if (error instanceof Error) {
    return new ApiRequestError({
      code: "UNKNOWN_ERROR",
      message: error.message || fallbackMessage,
      fieldErrors: [],
    })
  }

  return new ApiRequestError({
    code: "UNKNOWN_ERROR",
    message: fallbackMessage,
    fieldErrors: [],
  })
}

export function createValidationError(message: string, fieldErrors: ApiFieldError[]): ApiRequestError {
  return new ApiRequestError({
    code: "VALIDATION_ERROR",
    message,
    fieldErrors,
    status: 400,
  })
}

export function mapFieldErrors(fieldErrors: ApiFieldError[]): Record<string, string> {
  return fieldErrors.reduce<Record<string, string>>((acc, item) => {
    if (item.field && !acc[item.field]) {
      acc[item.field] = item.message
    }
    return acc
  }, {})
}
