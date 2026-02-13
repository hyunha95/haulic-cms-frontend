"use client"

import { useMutation } from "@tanstack/react-query"
import type { AxiosProgressEvent } from "axios"
import { useState } from "react"

import { apiClient, uploadClient } from "@/lib/api-client"
import { ApiRequestError, createValidationError, normalizeApiError } from "@/lib/api-error"
import type {
  AllowedUploadContentType,
  ApiFieldError,
  CreateProductRequest,
  PresignRequest,
  PresignResponse,
  ProductBadge,
  ProductResponse,
  ProductStatus,
  UploadPurpose,
} from "@/lib/types"

const ALLOWED_CONTENT_TYPES: AllowedUploadContentType[] = ["image/jpeg", "image/png", "image/webp"]

const EXTENSION_CONTENT_TYPE_MAP: Record<string, AllowedUploadContentType> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
}

export interface PresignUploadInput {
  file: File
  purpose?: UploadPurpose
  onProgress?: (percent: number) => void
}

export interface PresignUploadResult {
  fileUrl: string
  objectKey: string
  expiresInSeconds: number
}

export interface CreateProductResult {
  product: ProductResponse
  location?: string
}

export interface CreateProductWithUploadsFormInput {
  name: string
  category: string
  price: number | string
  stock: number | string
  status?: ProductStatus
  badge?: ProductBadge
  originalPrice?: number | string
  isActive?: boolean
}

export interface CreateProductWithUploadsImagesInput {
  main?: File | null
  additional?: File[]
  detail?: File | null
}

export interface CreateProductWithUploadsInput {
  form: CreateProductWithUploadsFormInput
  images: CreateProductWithUploadsImagesInput
}

interface NormalizedCreateProductInput {
  payload: CreateProductRequest
  images: {
    main?: File
    additional: File[]
    detail?: File
  }
}

function resolveUploadContentType(file: File): AllowedUploadContentType | null {
  const directType = file.type as AllowedUploadContentType
  if (ALLOWED_CONTENT_TYPES.includes(directType)) {
    return directType
  }

  const extension = file.name.split(".").pop()?.toLowerCase()
  if (!extension) {
    return null
  }

  return EXTENSION_CONTENT_TYPE_MAP[extension] ?? null
}

function validateFileType(
  file: File | null | undefined,
  field: string,
  fieldErrors: ApiFieldError[],
): void {
  if (!file) {
    return
  }

  if (!resolveUploadContentType(file)) {
    fieldErrors.push({
      field,
      message: "image/jpeg, image/png, image/webp 파일만 업로드할 수 있습니다.",
    })
  }
}

function normalizeFormInput(input: CreateProductWithUploadsInput): NormalizedCreateProductInput {
  const fieldErrors: ApiFieldError[] = []

  console.log("=== normalizeFormInput Debug ===")
  console.log("Input:", input)

  const name = input.form.name.trim()
  if (!name) {
    fieldErrors.push({ field: "name", message: "name is required" })
  }

  const category = input.form.category.trim()
  if (!category) {
    fieldErrors.push({ field: "category", message: "category is required" })
  }

  const price = Number(input.form.price)
  if (!Number.isFinite(price) || price <= 0) {
    fieldErrors.push({ field: "price", message: "price must be greater than 0" })
  }

  const stock = Number(input.form.stock)
  if (!Number.isFinite(stock) || !Number.isInteger(stock) || stock < 0) {
    fieldErrors.push({ field: "stock", message: "stock must be an integer greater than or equal to 0" })
  }

  const status = input.form.status ?? "draft"
  if (!["draft", "published", "scheduled"].includes(status)) {
    fieldErrors.push({ field: "status", message: "status must be draft, published, or scheduled" })
  }

  const badge = input.form.badge
  if (badge && !["NEW", "HOT"].includes(badge)) {
    fieldErrors.push({ field: "badge", message: "badge must be NEW or HOT" })
  }

  let originalPrice: number | undefined
  const originalPriceRaw = input.form.originalPrice
  if (originalPriceRaw !== undefined && String(originalPriceRaw).trim().length > 0) {
    const parsedOriginalPrice = Number(originalPriceRaw)
    if (!Number.isFinite(parsedOriginalPrice) || parsedOriginalPrice <= 0) {
      fieldErrors.push({ field: "originalPrice", message: "originalPrice must be greater than 0" })
    } else {
      originalPrice = parsedOriginalPrice
    }
  }

  const additionalFilesRaw = input.images.additional ?? []
  if (additionalFilesRaw.length > 9) {
    fieldErrors.push({ field: "additionalImages", message: "additionalImages can contain at most 9 items" })
  }
  const additionalFiles = additionalFilesRaw.slice(0, 9)

  console.log("Validating file types...")
  console.log("Main image:", input.images.main ? `${input.images.main.name} (${input.images.main.type})` : null)
  console.log("Detail image:", input.images.detail ? `${input.images.detail.name} (${input.images.detail.type})` : null)
  console.log("Additional images:", additionalFiles.map(f => `${f.name} (${f.type})`))

  validateFileType(input.images.main, "image", fieldErrors)
  validateFileType(input.images.detail, "detailDescriptionImage", fieldErrors)
  for (const file of additionalFiles) {
    validateFileType(file, "additionalImages", fieldErrors)
  }

  if (fieldErrors.length > 0) {
    console.error("Validation failed with errors:", fieldErrors)
    throw createValidationError("Request validation failed.", fieldErrors)
  }

  const payload: CreateProductRequest = {
    name,
    category,
    price,
    stock: parseInt(String(stock), 10),
    status: status as ProductStatus,
    isActive: Boolean(input.form.isActive),
  }

  if (badge) {
    payload.badge = badge
  }

  if (originalPrice !== undefined) {
    payload.originalPrice = originalPrice
  }

  return {
    payload,
    images: {
      main: input.images.main ?? undefined,
      additional: additionalFiles,
      detail: input.images.detail ?? undefined,
    },
  }
}

async function presignAndUploadFile(input: PresignUploadInput): Promise<PresignUploadResult> {
  const purpose = input.purpose ?? "product_main"
  const contentType = resolveUploadContentType(input.file)

  if (!contentType) {
    throw createValidationError("Request validation failed.", [
      { field: "images", message: "이미지 형식을 확인해주세요." },
    ])
  }

  const presignRequest: PresignRequest = {
    fileName: input.file.name,
    contentType,
    purpose,
  }

  let presignResponse: PresignResponse
  try {
    const response = await apiClient.post<PresignResponse>("/admin/uploads/presign", presignRequest)
    presignResponse = response.data
  } catch (error) {
    throw normalizeApiError(error, "업로드 URL 발급에 실패했습니다.")
  }

  try {
    await uploadClient.put(presignResponse.uploadUrl, input.file, {
      headers: {
        "Content-Type": contentType,
      },
      withCredentials: false,
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (!input.onProgress || !progressEvent.total) {
          return
        }

        const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100)
        input.onProgress(Math.max(0, Math.min(100, percent)))
      },
    })
  } catch (error) {
    throw normalizeApiError(error, `${input.file.name} 업로드에 실패했습니다.`)
  }

  input.onProgress?.(100)

  return {
    fileUrl: presignResponse.fileUrl,
    objectKey: presignResponse.objectKey,
    expiresInSeconds: presignResponse.expiresInSeconds,
  }
}

async function createProduct(payload: CreateProductRequest): Promise<CreateProductResult> {
  try {
    const response = await apiClient.post<ProductResponse>("/admin/products", payload)
    const location = response.headers.location as string | undefined

    return {
      product: response.data,
      location,
    }
  } catch (error) {
    throw normalizeApiError(error, "상품 생성에 실패했습니다.")
  }
}

export function usePresignUpload() {
  return useMutation<PresignUploadResult, ApiRequestError, PresignUploadInput>({
    mutationFn: presignAndUploadFile,
  })
}

export function useCreateProduct() {
  return useMutation<CreateProductResult, ApiRequestError, CreateProductRequest>({
    mutationFn: createProduct,
  })
}

export function useCreateProductWithUploads() {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const mutation = useMutation<CreateProductResult, ApiRequestError, CreateProductWithUploadsInput>({
    mutationFn: async (input: CreateProductWithUploadsInput): Promise<CreateProductResult> => {
      const normalizedInput = normalizeFormInput(input)
      setUploadProgress({})

      let mainImageUrl: string | undefined
      const additionalImageUrls: string[] = []
      let detailImageUrl: string | undefined

      if (normalizedInput.images.main) {
        const progressKey = "main"
        setUploadProgress((prev) => ({ ...prev, [progressKey]: 0 }))
        const uploaded = await presignAndUploadFile({
          file: normalizedInput.images.main,
          purpose: "product_main",
          onProgress: (percent) => {
            setUploadProgress((prev) => ({ ...prev, [progressKey]: percent }))
          },
        })
        mainImageUrl = uploaded.fileUrl
      }

      for (const [index, file] of normalizedInput.images.additional.entries()) {
        const progressKey = `additional-${index}`
        setUploadProgress((prev) => ({ ...prev, [progressKey]: 0 }))

        const uploaded = await presignAndUploadFile({
          file,
          purpose: "product_additional",
          onProgress: (percent) => {
            setUploadProgress((prev) => ({ ...prev, [progressKey]: percent }))
          },
        })

        additionalImageUrls.push(uploaded.fileUrl)
      }

      if (normalizedInput.images.detail) {
        const progressKey = "detail"
        setUploadProgress((prev) => ({ ...prev, [progressKey]: 0 }))

        const uploaded = await presignAndUploadFile({
          file: normalizedInput.images.detail,
          purpose: "product_detail",
          onProgress: (percent) => {
            setUploadProgress((prev) => ({ ...prev, [progressKey]: percent }))
          },
        })

        detailImageUrl = uploaded.fileUrl
      }

      const payload: CreateProductRequest = {
        ...normalizedInput.payload,
      }

      if (mainImageUrl) {
        payload.image = mainImageUrl
      }
      if (additionalImageUrls.length > 0) {
        payload.additionalImages = additionalImageUrls
      }
      if (detailImageUrl) {
        payload.detailDescriptionImage = detailImageUrl
      }

      return createProduct(payload)
    },
  })

  return {
    ...mutation,
    uploadProgress,
  }
}
