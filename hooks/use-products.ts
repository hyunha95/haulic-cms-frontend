"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import { normalizeApiError, type ApiRequestError } from "@/lib/api-error"
import type { ProductResponse, UpdateProductCommand } from "@/lib/types"

interface ProductsQueryParams {
  category?: string
  name?: string
  page?: number
  size?: number
  sort?: string
  direction?: "ASC" | "DESC"
}

interface ProductsPageResponse {
  content: ProductResponse[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

async function fetchProducts(params: ProductsQueryParams = {}): Promise<ProductsPageResponse> {
  try {
    const searchParams = new URLSearchParams()
    if (params.category) searchParams.append("category", params.category)
    if (params.name) searchParams.append("name", params.name)
    searchParams.append("page", String(params.page ?? 0))
    searchParams.append("size", String(params.size ?? 10))
    searchParams.append("sort", params.sort ?? "createdAt")
    searchParams.append("direction", params.direction ?? "DESC")

    const response = await apiClient.get<ProductsPageResponse>(
      `/admin/products?${searchParams.toString()}`
    )
    return response.data
  } catch (error) {
    throw normalizeApiError(error, "상품 목록 조회에 실패했습니다.")
  }
}

async function fetchProduct(id: string): Promise<ProductResponse> {
  try {
    const response = await apiClient.get<ProductResponse>(`/admin/products/${id}`)
    return response.data
  } catch (error) {
    throw normalizeApiError(error, "상품 조회에 실패했습니다.")
  }
}

async function updateProduct(id: string, data: UpdateProductCommand): Promise<ProductResponse> {
  try {
    const response = await apiClient.put<ProductResponse>(`/admin/products/${id}`, data)
    return response.data
  } catch (error) {
    throw normalizeApiError(error, "상품 수정에 실패했습니다.")
  }
}

async function deleteProduct(id: string): Promise<void> {
  try {
    await apiClient.delete(`/admin/products/${id}`)
  } catch (error) {
    throw normalizeApiError(error, "상품 삭제에 실패했습니다.")
  }
}

async function bulkDeleteProducts(ids: string[]): Promise<void> {
  try {
    const params = new URLSearchParams()
    ids.forEach((id) => params.append("ids", id))
    await apiClient.delete(`/admin/products?${params.toString()}`)
  } catch (error) {
    throw normalizeApiError(error, "상품 일괄 삭제에 실패했습니다.")
  }
}

export function useProducts(params: ProductsQueryParams = {}) {
  return useQuery<ProductsPageResponse, ApiRequestError>({
    queryKey: ["products", params],
    queryFn: () => fetchProducts(params),
  })
}

export function useProduct(id: string | undefined) {
  return useQuery<ProductResponse, ApiRequestError>({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id!),
    enabled: !!id,
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation<ProductResponse, ApiRequestError, { id: string; data: UpdateProductCommand }>({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.setQueryData(["product", data.id], data)
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation<void, ApiRequestError, string>({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

export function useBulkDeleteProducts() {
  const queryClient = useQueryClient()

  return useMutation<void, ApiRequestError, string[]>({
    mutationFn: bulkDeleteProducts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}
