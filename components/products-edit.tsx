"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {ArrowLeft, ChevronRight, ImageIcon, Plus, Save, Search, Trash2, AlertTriangle, Loader2} from "lucide-react"
import { useEffect, useMemo, useState, type ChangeEvent } from "react"
import { useForm, Controller, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { useCreateProductWithUploads } from "@/hooks/use-product-create"
import { useProduct, useUpdateProduct } from "@/hooks/use-products"
import { normalizeApiError } from "@/lib/api-error"
import {
  DEFAULT_PRODUCT_CATEGORY_TREE,
  findCategoryPathIdsByValue,
  getCategoryPathNamesByIds,
  joinCategoryPath,
  readProductCategoryTreeFromStorage,
  type ProductCategoryNode,
} from "@/lib/product-categories-storage"
import type { ProductBadge, ProductStatus, UpdateProductCommand } from "@/lib/types"
import { cn } from "@/lib/utils"
import { KcCertificationSection } from "@/components/kc-certification-section"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// Zod validation schema
const productFormSchema = z.object({
  name: z.string()
    .min(1, "상품명을 입력해주세요")
    .min(2, "상품명은 최소 2자 이상이어야 합니다")
    .max(200, "상품명은 최대 200자까지 입력 가능합니다"),
  category: z.string()
    .min(1, "카테고리를 선택해주세요"),
  price: z.string()
    .min(1, "판매가를 입력해주세요")
    .refine((val) => !isNaN(Number(val)), "판매가는 숫자만 입력 가능합니다")
    .refine((val) => Number(val) > 0, "판매가는 0보다 커야 합니다")
    .refine((val) => Number(val) <= 100000000, "판매가는 1억원을 초과할 수 없습니다"),
  stock: z.string()
    .min(1, "재고를 입력해주세요")
    .refine((val) => !isNaN(Number(val)), "재고는 숫자만 입력 가능합니다")
    .refine((val) => Number(val) >= 0, "재고는 0 이상이어야 합니다")
    .refine((val) => Number.isInteger(Number(val)), "재고는 정수만 입력 가능합니다")
    .refine((val) => Number(val) <= 999999, "재고는 최대 999,999개까지 입력 가능합니다"),
  status: z.enum(["draft", "published", "scheduled"], {
    required_error: "상태를 선택해주세요"
  }),
  badge: z.union([
    z.enum(["NEW", "HOT"]),
    z.literal("none")
  ]).default("none"),
  originalPrice: z.string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), "정가는 숫자만 입력 가능합니다")
    .refine((val) => !val || Number(val) > 0, "정가는 0보다 커야 합니다")
    .refine((val) => !val || Number(val) <= 100000000, "정가는 1억원을 초과할 수 없습니다"),
  isActive: z.boolean().default(false),
})

type ProductFormData = z.infer<typeof productFormSchema>

// 허용된 이미지 파일 형식
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"]

function isValidImageFile(file: File): boolean {
  if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return true
  }
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0]
  return extension ? ALLOWED_IMAGE_EXTENSIONS.includes(extension) : false
}

interface ProductEditImagesState {
  main: File | null
  additional: File[]
  detail: File | null
}

interface UpdateSuccessState {
  productId: string
}

interface ImageStats {
  width: number
  height: number
  bytes: number
  format: string
}

interface ImageCompressionResult {
  imageData: string
  original: ImageStats
  compressed: ImageStats
  usedCompressed: boolean
}

function getUploadProgressLabel(key: string): string {
  if (key === "main") {
    return "대표 이미지"
  }
  if (key === "detail") {
    return "상세설명 이미지"
  }
  if (key.startsWith("additional-")) {
    const index = Number(key.split("-")[1])
    const order = Number.isFinite(index) ? index + 1 : 1
    return `추가 이미지 ${order}`
  }
  return key
}

function findNodeById(nodes: ProductCategoryNode[], id: string) {
  return nodes.find((node) => node.id === id)
}

function formatImageBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(2)} MB`
}

function formatImageDimensions(stats: ImageStats) {
  return `${stats.width} x ${stats.height}px`
}

interface ProductsEditProps {
  productId: string
}

export function ProductsEdit({ productId }: ProductsEditProps) {
  const router = useRouter()
  const uploadMutation = useCreateProductWithUploads()
  const updateMutation = useUpdateProduct()

  // 기존 상품 데이터 로드
  const { data: product, isLoading: isLoadingProduct, error: loadError } = useProduct(productId)

  // React Hook Form setup
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      category: "",
      price: "",
      stock: "0",
      status: "draft",
      badge: "none",
      originalPrice: "",
      isActive: false,
    },
  })

  const [images, setImages] = useState<ProductEditImagesState>({
    main: null,
    additional: [],
    detail: null,
  })
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState<UpdateSuccessState | null>(null)
  const [categoryTree, setCategoryTree] = useState(DEFAULT_PRODUCT_CATEGORY_TREE)
  const [selectedPathIds, setSelectedPathIds] = useState<string[]>([])
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null)
  const [imagePreviews, setImagePreviews] = useState<{
    main: string | null
    additional: string[]
    detail: string | null
  }>({
    main: null,
    additional: [],
    detail: null,
  })

  // 기존 이미지 URL 저장 (변경되지 않은 경우 사용)
  const [existingImageUrls, setExistingImageUrls] = useState<{
    main?: string
    additional: string[]
    detail?: string
  }>({
    main: undefined,
    additional: [],
    detail: undefined,
  })

  // Watch form values
  const categoryValue = watch("category")

  useEffect(() => {
    const storedCategoryTree = readProductCategoryTreeFromStorage()
    if (storedCategoryTree && storedCategoryTree.length > 0) {
      setCategoryTree(storedCategoryTree)
    }
  }, [])

  useEffect(() => {
    const pathIds = findCategoryPathIdsByValue(categoryTree, categoryValue).slice(0, 4)
    setSelectedPathIds(pathIds)
  }, [categoryTree, categoryValue])

  // 상품 데이터 로드 시 폼 초기화
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        category: product.category,
        price: String(product.price),
        stock: String(product.stock),
        status: product.status,
        badge: product.badge || "none",
        originalPrice: product.originalPrice ? String(product.originalPrice) : "",
        isActive: product.isActive ?? false,
      })

      // 기존 이미지 URL 저장
      setExistingImageUrls({
        main: product.image,
        additional: product.additionalImages || [],
        detail: product.detailDescriptionImage,
      })

      // 기존 이미지 미리보기 설정
      setImagePreviews({
        main: product.image || null,
        additional: product.additionalImages || [],
        detail: product.detailDescriptionImage || null,
      })
    }
  }, [product, reset])

  const additionalCount = images.additional.length + (existingImageUrls.additional?.length || 0)
  const progressEntries = Object.entries(uploadMutation.uploadProgress) as Array<[string, number]>

  const depth1Options = categoryTree
  const depth2Options = useMemo(() => {
    const depth1Node = findNodeById(depth1Options, selectedPathIds[0] || "")
    return depth1Node?.children || []
  }, [depth1Options, selectedPathIds])

  const depth3Options = useMemo(() => {
    const depth2Node = findNodeById(depth2Options, selectedPathIds[1] || "")
    return depth2Node?.children || []
  }, [depth2Options, selectedPathIds])

  const depth4Options = useMemo(() => {
    const depth3Node = findNodeById(depth3Options, selectedPathIds[2] || "")
    return depth3Node?.children || []
  }, [depth3Options, selectedPathIds])

  const categoryColumns = [depth1Options, depth2Options, depth3Options, depth4Options]
  const selectedPathLabel = getCategoryPathNamesByIds(categoryTree, selectedPathIds).join(" > ")

  const handleSelectDepth = (depth: number, nodeId: string) => {
    const nextPathIds = [...selectedPathIds.slice(0, depth - 1), nodeId]
    setSelectedPathIds(nextPathIds)

    const pathNames = getCategoryPathNamesByIds(categoryTree, nextPathIds)
    setValue("category", joinCategoryPath(pathNames), { shouldValidate: true })
  }

  const handleMainImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null

    if (file) {
      if (!isValidImageFile(file)) {
        setSubmitError(`지원하지 않는 파일 형식입니다. JPG, PNG, WebP 파일만 업로드 가능합니다. (선택한 파일: ${file.name})`)
        event.target.value = ""
        return
      }

      setImages((prev) => ({ ...prev, main: file }))

      // 미리보기 생성
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreviews((prev) => ({ ...prev, main: reader.result as string }))
      }
      reader.readAsDataURL(file)
    } else {
      setImages((prev) => ({ ...prev, main: null }))
    }

    event.target.value = ""
  }

  const handleDetailImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null

    if (file) {
      if (!isValidImageFile(file)) {
        setSubmitError(`지원하지 않는 파일 형식입니다. JPG, PNG, WebP 파일만 업로드 가능합니다. (선택한 파일: ${file.name})`)
        event.target.value = ""
        return
      }

      setImages((prev) => ({ ...prev, detail: file }))

      const reader = new FileReader()
      reader.onload = () => {
        setImagePreviews((prev) => ({ ...prev, detail: reader.result as string }))
      }
      reader.readAsDataURL(file)
    } else {
      setImages((prev) => ({ ...prev, detail: null }))
    }

    event.target.value = ""
  }

  const handleAdditionalImagesChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? [])
    if (selectedFiles.length === 0) {
      return
    }

    const invalidFiles = selectedFiles.filter(file => !isValidImageFile(file))
    if (invalidFiles.length > 0) {
      const fileNames = invalidFiles.map(f => f.name).join(", ")
      setSubmitError(`지원하지 않는 파일 형식입니다. JPG, PNG, WebP 파일만 업로드 가능합니다. (선택한 파일: ${fileNames})`)
      event.target.value = ""
      return
    }

    const currentFiles = images.additional
    const currentExistingCount = existingImageUrls.additional.length
    const availableSlots = 9 - currentExistingCount
    const newFiles = [...currentFiles, ...selectedFiles].slice(0, availableSlots)

    setImages((prev) => ({ ...prev, additional: newFiles }))

    // 미리보기 생성
    Promise.all(
      newFiles.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
      })
    ).then((previews) => {
      setImagePreviews((prev) => ({
        ...prev,
        additional: [...existingImageUrls.additional, ...previews]
      }))
    })

    event.target.value = ""
  }

  const handleRemoveAdditionalImage = (index: number) => {
    const existingCount = existingImageUrls.additional.length

    if (index < existingCount) {
      // 기존 이미지 제거
      setExistingImageUrls((prev) => ({
        ...prev,
        additional: prev.additional.filter((_, i) => i !== index)
      }))
    } else {
      // 새로 추가한 이미지 제거
      const newImageIndex = index - existingCount
      setImages((prev) => ({
        ...prev,
        additional: prev.additional.filter((_, i) => i !== newImageIndex)
      }))
    }

    setImagePreviews((prev) => ({
      ...prev,
      additional: prev.additional.filter((_, i) => i !== index)
    }))
  }

  const handleRemoveMainImage = () => {
    setImages((prev) => ({ ...prev, main: null }))
    setExistingImageUrls((prev) => ({ ...prev, main: undefined }))
    setImagePreviews((prev) => ({ ...prev, main: null }))
  }

  const handleRemoveDetailImage = () => {
    setImages((prev) => ({ ...prev, detail: null }))
    setExistingImageUrls((prev) => ({ ...prev, detail: undefined }))
    setImagePreviews((prev) => ({ ...prev, detail: null }))
  }

  const handleOpenImagePreview = (src: string, alt: string) => {
    setPreviewImage({ src, alt })
  }

  const handlePreviewDialogOpenChange = (open: boolean) => {
    if (!open) {
      setPreviewImage(null)
    }
  }

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    setSuccess(null)
    setSubmitError(null)

    console.log("=== Form Submission Debug ===")
    console.log("Form data:", data)
    console.log("Images:", {
      main: images.main ? `${images.main.name} (${images.main.type}, ${images.main.size} bytes)` : "기존 이미지 유지",
      additional: images.additional.map(f => `${f.name} (${f.type}, ${f.size} bytes)`),
      detail: images.detail ? `${images.detail.name} (${images.detail.type}, ${images.detail.size} bytes)` : "기존 이미지 유지",
    })

    try {
      // 이미지가 새로 업로드된 경우에만 업로드 처리
      let uploadedImageUrls = {
        main: existingImageUrls.main,
        additional: existingImageUrls.additional,
        detail: existingImageUrls.detail,
      }

      // 새 이미지가 있으면 업로드
      if (images.main || images.additional.length > 0 || images.detail) {
        const uploadResult = await uploadMutation.mutateAsync({
          form: {
            name: data.name,
            category: data.category,
            price: Number(data.price),
            stock: Number(data.stock),
            status: data.status,
            badge: data.badge === "none" ? undefined : data.badge,
            originalPrice: data.originalPrice && data.originalPrice.trim().length > 0 ? Number(data.originalPrice) : undefined,
            isActive: data.isActive,
          },
          images: {
            main: images.main,
            additional: images.additional,
            detail: images.detail,
          },
        })

        // 업로드된 이미지 URL 사용
        if (images.main) uploadedImageUrls.main = uploadResult.product.image
        if (images.additional.length > 0) {
          uploadedImageUrls.additional = [...existingImageUrls.additional, ...(uploadResult.product.additionalImages || [])]
        }
        if (images.detail) uploadedImageUrls.detail = uploadResult.product.detailDescriptionImage
      }

      // 상품 업데이트
      const updateData: UpdateProductCommand = {
        name: data.name,
        category: data.category,
        price: Number(data.price),
        stock: Number(data.stock),
        status: data.status,
        badge: data.badge === "none" ? undefined : data.badge,
        originalPrice: data.originalPrice && data.originalPrice.trim().length > 0 ? Number(data.originalPrice) : undefined,
        isActive: data.isActive,
        image: uploadedImageUrls.main,
        additionalImages: uploadedImageUrls.additional,
        detailDescriptionImage: uploadedImageUrls.detail,
      }

      await updateMutation.mutateAsync({ id: productId, data: updateData })

      setSuccess({
        productId: productId,
      })

      // 1.5초 후 상품 목록 페이지로 리다이렉트
      setTimeout(() => {
        router.push("/products")
      }, 1500)
    } catch (error) {
      console.error("=== Submit Error ===", error)
      const normalizedError = normalizeApiError(error, "상품 수정 요청에 실패했습니다.")
      console.error("Normalized error:", normalizedError)

      if (normalizedError.fieldErrors && normalizedError.fieldErrors.length > 0) {
        console.error("Field errors:", normalizedError.fieldErrors)
        const errorMessages = normalizedError.fieldErrors.map(fe => `${fe.field}: ${fe.message}`).join(", ")
        setSubmitError(`${normalizedError.message} - ${errorMessages}`)
      } else {
        setSubmitError(normalizedError.message)
      }
    }
  }

  // 로딩 상태
  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">상품 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // 에러 상태
  if (loadError) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
              <Link href="/products">
                <ArrowLeft className="h-4 w-4 mr-1" />
                상품 관리로 돌아가기
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-foreground">상품 수정</h1>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>상품을 불러올 수 없습니다</AlertTitle>
          <AlertDescription>
            {loadError.message}
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push("/products")}>
                목록으로 돌아가기
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // 상품이 없는 경우
  if (!product) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
              <Link href="/products">
                <ArrowLeft className="h-4 w-4 mr-1" />
                상품 관리로 돌아가기
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-foreground">상품 수정</h1>
          </div>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>상품을 찾을 수 없습니다</AlertTitle>
          <AlertDescription>
            요청하신 상품이 존재하지 않습니다.
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={() => router.push("/products")}>
                목록으로 돌아가기
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
            <Link href="/products">
              <ArrowLeft className="h-4 w-4 mr-1" />
              상품 관리로 돌아가기
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">상품 수정</h1>
          <p className="text-sm text-muted-foreground mt-1">
            상품 정보를 수정하고 저장하세요.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/products">취소</Link>
          </Button>
          <Button type="submit" form="product-form" disabled={!isValid || uploadMutation.isPending || updateMutation.isPending || isSubmitting}>
            <Save className="h-4 w-4 mr-1" />
            {uploadMutation.isPending || updateMutation.isPending || isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </div>
      </div>

      {Object.keys(errors).length > 0 && !isSubmitting && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>입력 오류가 있습니다</AlertTitle>
          <AlertDescription>
            <p className="mb-2">다음 항목을 확인해주세요:</p>
            <ul className="list-disc list-inside space-y-1">
              {errors.name && <li>{errors.name.message}</li>}
              {errors.category && <li>{errors.category.message}</li>}
              {errors.price && <li>{errors.price.message}</li>}
              {errors.stock && <li>{errors.stock.message}</li>}
              {errors.status && <li>{errors.status.message}</li>}
              {errors.badge && <li>{errors.badge.message}</li>}
              {errors.originalPrice && <li>{errors.originalPrice.message}</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {submitError ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>저장 실패</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      ) : null}

      {success ? (
        <Alert>
          <AlertTitle>상품 수정 완료</AlertTitle>
          <AlertDescription className="space-y-1">
            <p>상품 ID: {success.productId}</p>
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>상품 기본 정보</CardTitle>
          <CardDescription>모든 정보를 하나의 화면에서 입력하고 저장하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">상품명 *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="상품명을 입력하세요"
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>카테고리 *</Label>
                <div className="overflow-x-auto rounded-md border border-border">
                  <div className="min-w-[760px] grid grid-cols-4 divide-x divide-border">
                    {categoryColumns.map((nodes, index) => {
                      const depth = index + 1
                      const selectedId = selectedPathIds[index]

                      return (
                        <div key={`category-depth-${depth}`} className="min-h-[420px] py-2">
                          {nodes.length === 0 ? (
                            <p className="px-6 py-3 text-sm text-muted-foreground">
                              선택 가능한 카테고리가 없습니다.
                            </p>
                          ) : (
                            <ul>
                              {nodes.map((node) => {
                                const isSelected = selectedId === node.id
                                const hasNextDepth = depth < 4 && node.children.length > 0

                                return (
                                  <li key={node.id}>
                                    <button
                                      type="button"
                                      onClick={() => handleSelectDepth(depth, node.id)}
                                      className="flex w-full items-center justify-between px-6 py-3 text-left text-[13px] leading-[1.35] tracking-[-0.03em] transition-colors hover:bg-muted/40"
                                    >
                                      <span
                                        className={cn(
                                          "truncate",
                                          isSelected ? "font-semibold text-[#58bd56]" : "text-foreground",
                                        )}
                                      >
                                        {node.name}
                                      </span>
                                      {hasNextDepth && (
                                        <ChevronRight
                                          className={cn(
                                            "h-6 w-6 shrink-0",
                                            isSelected ? "text-[#58bd56]" : "text-muted-foreground",
                                          )}
                                        />
                                      )}
                                    </button>
                                  </li>
                                )
                              })}
                            </ul>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  선택된 경로: {selectedPathLabel || "없음"}
                </p>
                {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">판매가 *</Label>
                <Input
                  id="price"
                  type="number"
                  min={1}
                  {...register("price")}
                  placeholder="3900"
                />
                {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">재고 *</Label>
                <Input
                  id="stock"
                  type="number"
                  min={0}
                  step={1}
                  {...register("stock")}
                  placeholder="120"
                />
                {errors.stock && <p className="text-xs text-destructive">{errors.stock.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">상태</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">draft</SelectItem>
                        <SelectItem value="published">published</SelectItem>
                        <SelectItem value="scheduled">scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && <p className="text-xs text-destructive">{errors.status.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="badge">뱃지</Label>
                <Controller
                  name="badge"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="badge">
                        <SelectValue placeholder="none" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">none</SelectItem>
                        <SelectItem value="NEW">NEW</SelectItem>
                        <SelectItem value="HOT">HOT</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.badge && <p className="text-xs text-destructive">{errors.badge.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="originalPrice">정가 (선택)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  min={1}
                  {...register("originalPrice")}
                  placeholder="5900"
                />
                {errors.originalPrice && (
                  <p className="text-xs text-destructive">{errors.originalPrice.message}</p>
                )}
              </div>

              <div className="flex items-end">
                <label htmlFor="isActive" className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="isActive"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  활성화
                </label>
              </div>
            </div>

            <div className="space-y-4 rounded-md border border-border p-4">
              <h2 className="text-base font-semibold">이미지 업로드</h2>

              <div className="space-y-2">
                <Label htmlFor="main-image">대표 이미지 (선택)</Label>
                <Input id="main-image" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={handleMainImageChange} />
                <p className="text-xs text-muted-foreground">JPG, PNG, WebP 형식만 업로드 가능합니다.</p>
                {imagePreviews.main ? (
                  <div className="rounded-md border border-border bg-muted/30 p-4">
                    <p className="mb-2 text-xs font-medium text-foreground">
                      {images.main ? `새 파일: ${images.main.name}` : "기존 이미지"}
                    </p>
                    <div className="relative h-56 overflow-hidden rounded-md bg-muted">
                      <img
                        src={imagePreviews.main}
                        alt="대표 이미지 미리보기"
                        className="h-full w-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="absolute right-2 top-2 h-8 w-8 border border-border bg-background/90 backdrop-blur-sm hover:bg-background"
                        onClick={() => handleOpenImagePreview(imagePreviews.main!, "대표 이미지 미리보기")}
                        aria-label="대표 이미지 확대 보기"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-destructive hover:text-destructive"
                      onClick={handleRemoveMainImage}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      대표 이미지 제거
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-10 text-center">
                    <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">대표 이미지를 업로드하세요.</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="additional-images">추가 이미지 (최대 9개)</Label>
                  <span className="text-xs text-muted-foreground">{additionalCount}/9</span>
                </div>
                <Input
                  id="additional-images"
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  disabled={additionalCount >= 9}
                  onChange={handleAdditionalImagesChange}
                />
                <p className="text-xs text-muted-foreground">JPG, PNG, WebP 형식만 업로드 가능하며, 최대 9개까지 등록됩니다.</p>

                {additionalCount === 0 ? (
                  <div className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
                    추가 이미지는 최대 9개까지 등록할 수 있습니다.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {imagePreviews.additional.map((imageUrl, index) => {
                      const isExisting = index < existingImageUrls.additional.length
                      return (
                        <div key={`${imageUrl}-${index}`} className="rounded-md border border-border p-3">
                          <p className="mb-2 truncate text-xs font-medium text-foreground">
                            {isExisting ? "기존 이미지" : `새 파일: ${images.additional[index - existingImageUrls.additional.length]?.name}`}
                          </p>
                          <div className="relative h-36 overflow-hidden rounded-md bg-muted">
                            <img
                              src={imageUrl}
                              alt={`추가 이미지 ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              className="absolute right-2 top-2 h-8 w-8 border border-border bg-background/90 backdrop-blur-sm hover:bg-background"
                              onClick={() => handleOpenImagePreview(imageUrl, `추가 이미지 ${index + 1} 미리보기`)}
                              aria-label={`추가 이미지 ${index + 1} 확대 보기`}
                            >
                              <Search className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="mt-1 w-full text-destructive hover:text-destructive"
                            onClick={() => handleRemoveAdditionalImage(index)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            제거
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="detail-image">상세설명 이미지 (선택)</Label>
                <Input
                  id="detail-image"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={handleDetailImageChange}
                />
                <p className="text-xs text-muted-foreground">JPG, PNG, WebP 형식으로 세로로 긴 상세설명 이미지를 등록할 수 있습니다.</p>
                {imagePreviews.detail ? (
                  <div className="rounded-md border border-border bg-muted/30 p-3">
                    <p className="mb-2 text-xs font-medium text-foreground">
                      {images.detail ? `새 파일: ${images.detail.name}` : "기존 이미지"}
                    </p>
                    <div className="max-h-[420px] overflow-auto rounded-md bg-muted p-2">
                      <img
                        src={imagePreviews.detail}
                        alt="상세설명 이미지 미리보기"
                        className="w-full object-contain"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-destructive hover:text-destructive"
                      onClick={handleRemoveDetailImage}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      상세설명 이미지 제거
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">상세설명용 긴 이미지를 업로드하세요.</p>
                  </div>
                )}
              </div>
            </div>

            {uploadMutation.isPending && progressEntries.length > 0 ? (
              <div className="space-y-3 rounded-md border border-border p-4">
                <p className="text-sm font-medium text-foreground">업로드 진행 상태</p>
                {progressEntries.map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{getUploadProgressLabel(key)}</span>
                      <span>{value}%</span>
                    </div>
                    <Progress value={value} />
                  </div>
                ))}
              </div>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <KcCertificationSection />

      <Dialog open={Boolean(previewImage)} onOpenChange={handlePreviewDialogOpenChange}>
        <DialogContent className="w-[95vw] max-w-5xl p-3 sm:p-4">
          <DialogTitle className="sr-only">{previewImage?.alt ?? "이미지 미리보기"}</DialogTitle>
          <div className="rounded-md border border-border bg-muted/20">
            <div className="max-h-[80vh] overflow-auto p-2 sm:p-4">
              {previewImage ? (
                <img
                  src={previewImage.src}
                  alt={previewImage.alt}
                  className="mx-auto h-auto max-h-[calc(80vh-2rem)] w-auto max-w-full rounded-md object-contain"
                />
              ) : null}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">이미지가 팝업 크기를 넘지 않도록 자동으로 맞춰 표시됩니다.</p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
