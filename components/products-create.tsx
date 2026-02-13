"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ImageIcon, Plus, Save, Search, Trash2 } from "lucide-react"
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react"

import { useCreateProductWithUploads } from "@/hooks/use-product-create"
import { mapFieldErrors, normalizeApiError } from "@/lib/api-error"
import {
  DEFAULT_PRODUCT_CATEGORY_TREE,
  findCategoryPathIdsByValue,
  getCategoryPathNamesByIds,
  joinCategoryPath,
  readProductCategoryTreeFromStorage,
  type ProductCategoryNode,
} from "@/lib/product-categories-storage"
import type { ProductBadge, ProductStatus } from "@/lib/types"
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

interface ProductCreateFormState {
  name: string
  category: string
  price: string
  stock: string
  status: ProductStatus
  badge: ProductBadge | "none"
  originalPrice: string
  isActive: boolean
}

interface ProductCreateImagesState {
  main: File | null
  additional: File[]
  detail: File | null
}

interface CreateSuccessState {
  productId: string
  location?: string
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

function formatFileName(file: File | null | undefined): string {
  if (!file) {
    return "-"
  }

  return `${file.name} (${Math.round(file.size / 1024)} KB)`
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

export function ProductsCreate() {
  const mutation = useCreateProductWithUploads()

  const [form, setForm] = useState<ProductCreateFormState>({
    name: "",
    category: "",
    price: "",
    stock: "0",
    status: "draft",
    badge: "none",
    originalPrice: "",
    isActive: false,
  })
  const [images, setImages] = useState<ProductCreateImagesState>({
    main: null,
    additional: [],
    detail: null,
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState<CreateSuccessState | null>(null)
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
  const [primaryImageCompression, setPrimaryImageCompression] = useState<ImageCompressionResult | null>(null)
  const [additionalImageCompressions, setAdditionalImageCompressions] = useState<Record<string, ImageCompressionResult>>({})
  const [detailImageCompression, setDetailImageCompression] = useState<ImageCompressionResult | null>(null)

  useEffect(() => {
    const storedCategoryTree = readProductCategoryTreeFromStorage()
    if (storedCategoryTree && storedCategoryTree.length > 0) {
      setCategoryTree(storedCategoryTree)
    }
  }, [])

  useEffect(() => {
    const pathIds = findCategoryPathIdsByValue(categoryTree, form.category).slice(0, 4)
    setSelectedPathIds(pathIds)
  }, [categoryTree, form.category])

  const parsedPrice = Number(form.price)
  const parsedStock = Number(form.stock)
  const canSave = useMemo(
    () =>
      form.name.trim().length > 0 &&
      form.category.trim().length > 0 &&
      Number.isFinite(parsedPrice) &&
      parsedPrice > 0 &&
      Number.isFinite(parsedStock) &&
      Number.isInteger(parsedStock) &&
      parsedStock >= 0,
    [form.category, form.name, parsedPrice, parsedStock],
  )

  const additionalCount = images.additional.length
  const progressEntries = Object.entries(mutation.uploadProgress) as Array<[string, number]>

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

  const readBlobAsDataUrl = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result)
          return
        }
        reject(new Error("이미지 파일을 읽을 수 없습니다."))
      }
      reader.onerror = () => reject(new Error("이미지 파일을 읽을 수 없습니다."))
      reader.readAsDataURL(blob)
    })

  const loadImageElement = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error("이미지를 불러올 수 없습니다."))
      image.src = src
    })

  const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
    new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), type, quality)
    })

  const readImageFile = async (file: File): Promise<ImageCompressionResult> => {
    const originalImageData = await readBlobAsDataUrl(file)
    const fallbackStats: ImageStats = {
      width: 0,
      height: 0,
      bytes: file.size,
      format: file.type || "image/unknown",
    }

    let originalImage: HTMLImageElement
    try {
      originalImage = await loadImageElement(originalImageData)
    } catch {
      return {
        imageData: originalImageData,
        original: fallbackStats,
        compressed: fallbackStats,
        usedCompressed: false,
      }
    }

    const originalStats: ImageStats = {
      width: originalImage.naturalWidth,
      height: originalImage.naturalHeight,
      bytes: file.size,
      format: file.type || "image/unknown",
    }

    // 이미지가 충분히 작으면 압축하지 않음
    const maxSide = Math.max(originalImage.naturalWidth, originalImage.naturalHeight)
    const fileSizeKB = file.size / 1024
    const isSmallEnough = fileSizeKB <= 500 && maxSide <= 1500

    if (file.type === "image/gif" || file.type === "image/svg+xml" || isSmallEnough) {
      return {
        imageData: originalImageData,
        original: originalStats,
        compressed: originalStats,
        usedCompressed: false,
      }
    }

    try {
      const maxSide = 2000
      const longestSide = Math.max(originalImage.naturalWidth, originalImage.naturalHeight)
      const resizeRatio = longestSide > maxSide ? maxSide / longestSide : 1
      const targetWidth = Math.max(1, Math.round(originalImage.naturalWidth * resizeRatio))
      const targetHeight = Math.max(1, Math.round(originalImage.naturalHeight * resizeRatio))
      const canvas = document.createElement("canvas")
      canvas.width = targetWidth
      canvas.height = targetHeight

      const context = canvas.getContext("2d")
      if (!context) {
        return {
          imageData: originalImageData,
          original: originalStats,
          compressed: originalStats,
          usedCompressed: false,
        }
      }

      context.drawImage(originalImage, 0, 0, targetWidth, targetHeight)

      const outputType = file.type === "image/png" || file.type === "image/webp" ? "image/webp" : "image/jpeg"
      const qualities = [0.82, 0.72, 0.62]

      for (const quality of qualities) {
        const blob = await canvasToBlob(canvas, outputType, quality)
        if (!blob) {
          continue
        }

        if (blob.size <= file.size * 0.98 || quality === qualities[qualities.length - 1]) {
          if (blob.size >= file.size) {
            return {
              imageData: originalImageData,
              original: originalStats,
              compressed: originalStats,
              usedCompressed: false,
            }
          }

          const compressedImageData = await readBlobAsDataUrl(blob)
          return {
            imageData: compressedImageData,
            original: originalStats,
            compressed: {
              width: targetWidth,
              height: targetHeight,
              bytes: blob.size,
              format: outputType,
            },
            usedCompressed: true,
          }
        }
      }

      return {
        imageData: originalImageData,
        original: originalStats,
        compressed: originalStats,
        usedCompressed: false,
      }
    } catch {
      return {
        imageData: originalImageData,
        original: originalStats,
        compressed: originalStats,
        usedCompressed: false,
      }
    }
  }

  const renderCompressionInfo = (data: ImageCompressionResult | null) => {
    if (!data) return null

    const savedPercent =
      data.original.bytes > 0 ? Math.max(0, Math.round((1 - data.compressed.bytes / data.original.bytes) * 100)) : 0

    return (
      <div className="mt-2 rounded-md border border-border/70 bg-background/70 p-2 text-[11px] text-muted-foreground">
        <p className="font-medium text-foreground/90">이미지 정보</p>
        <p>
          원본: {formatImageDimensions(data.original)} / {formatImageBytes(data.original.bytes)}
        </p>
        <p>
          압축: {formatImageDimensions(data.compressed)} / {formatImageBytes(data.compressed.bytes)}{" "}
          ({data.usedCompressed ? `${savedPercent}% 감소` : "원본 유지"})
        </p>
      </div>
    )
  }

  const setFormField = <K extends keyof ProductCreateFormState>(field: K, value: ProductCreateFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSelectDepth = (depth: number, nodeId: string) => {
    const nextPathIds = [...selectedPathIds.slice(0, depth - 1), nodeId]
    setSelectedPathIds(nextPathIds)

    const pathNames = getCategoryPathNamesByIds(categoryTree, nextPathIds)
    setFormField("category", joinCategoryPath(pathNames))
  }

  const handleMainImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setImages((prev) => ({ ...prev, main: file }))

    if (file) {
      try {
        const imageResult = await readImageFile(file)
        setPrimaryImageCompression(imageResult)
        setImagePreviews((prev) => ({ ...prev, main: imageResult.imageData }))
      } catch {
        const reader = new FileReader()
        reader.onload = () => {
          setImagePreviews((prev) => ({ ...prev, main: reader.result as string }))
        }
        reader.readAsDataURL(file)
      }
    } else {
      setImagePreviews((prev) => ({ ...prev, main: null }))
      setPrimaryImageCompression(null)
    }

    event.target.value = ""
  }

  const handleDetailImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setImages((prev) => ({ ...prev, detail: file }))

    if (file) {
      try {
        const imageResult = await readImageFile(file)
        setDetailImageCompression(imageResult)
        setImagePreviews((prev) => ({ ...prev, detail: imageResult.imageData }))
      } catch {
        const reader = new FileReader()
        reader.onload = () => {
          setImagePreviews((prev) => ({ ...prev, detail: reader.result as string }))
        }
        reader.readAsDataURL(file)
      }
    } else {
      setImagePreviews((prev) => ({ ...prev, detail: null }))
      setDetailImageCompression(null)
    }

    event.target.value = ""
  }

  const handleAdditionalImagesChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? [])
    if (selectedFiles.length === 0) {
      return
    }

    const newFiles = [...images.additional, ...selectedFiles].slice(0, 9)
    setImages((prev) => ({ ...prev, additional: newFiles }))

    // Generate previews and compression info for all files
    try {
      const uploadedResults = await Promise.all(newFiles.map((file) => readImageFile(file)))
      const uploadedImages = uploadedResults.map((item) => item.imageData)

      setImagePreviews((prev) => ({ ...prev, additional: uploadedImages }))

      const compressionMap: Record<string, ImageCompressionResult> = {}
      for (const result of uploadedResults) {
        compressionMap[result.imageData] = result
      }
      setAdditionalImageCompressions(compressionMap)
    } catch {
      // Fallback to simple preview
      Promise.all(
        newFiles.map((file) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          })
        })
      ).then((previews) => {
        setImagePreviews((prev) => ({ ...prev, additional: previews }))
      })
    }

    event.target.value = ""
  }

  const handleRemoveAdditionalImage = (index: number) => {
    const targetImageUrl = imagePreviews.additional[index]
    if (targetImageUrl) {
      setAdditionalImageCompressions((prev) => {
        const next = { ...prev }
        delete next[targetImageUrl]
        return next
      })
    }

    setImages((prev) => ({
      ...prev,
      additional: prev.additional.filter((_, currentIndex) => currentIndex !== index),
    }))
    setImagePreviews((prev) => ({
      ...prev,
      additional: prev.additional.filter((_, currentIndex) => currentIndex !== index),
    }))
  }

  const handleOpenImagePreview = (src: string, alt: string) => {
    setPreviewImage({ src, alt })
  }

  const handlePreviewDialogOpenChange = (open: boolean) => {
    if (!open) {
      setPreviewImage(null)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSuccess(null)
    setSubmitError(null)
    setFieldErrors({})

    try {
      const result = await mutation.mutateAsync({
        form: {
          name: form.name,
          category: form.category,
          price: Number(form.price),
          stock: Number(form.stock),
          status: form.status,
          badge: form.badge === "none" ? undefined : form.badge,
          originalPrice: form.originalPrice.trim().length > 0 ? Number(form.originalPrice) : undefined,
          isActive: form.isActive,
        },
        images: {
          main: images.main,
          additional: images.additional,
          detail: images.detail,
        },
      })

      setSuccess({
        productId: result.product.id,
        location: result.location,
      })
      setImages({
        main: null,
        additional: [],
        detail: null,
      })
      setFieldErrors({})
    } catch (error) {
      const normalizedError = normalizeApiError(error, "상품 생성 요청에 실패했습니다.")
      setFieldErrors(mapFieldErrors(normalizedError.fieldErrors))
      setSubmitError(normalizedError.message)
    }
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
          <h1 className="text-2xl font-bold text-foreground">상품 등록</h1>
          <p className="text-sm text-muted-foreground mt-1">
            신규 상품 정보를 입력하고 저장하세요.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/products">취소</Link>
          </Button>
          <Button variant="outline" disabled={!canSave || mutation.isPending}>
            임시저장
          </Button>
          <Button type="submit" form="product-form" disabled={!canSave || mutation.isPending}>
            <Save className="h-4 w-4 mr-1" />
            {mutation.isPending ? "저장 중..." : "저장"}
          </Button>
        </div>
      </div>

      {submitError ? (
        <Alert variant="destructive">
          <AlertTitle>저장 실패</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      ) : null}

      {success ? (
        <Alert>
          <AlertTitle>상품 생성 완료</AlertTitle>
          <AlertDescription className="space-y-1">
            <p>생성된 상품 ID: {success.productId}</p>
            {success.location ? <p>Location: {success.location}</p> : null}
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>상품 기본 정보</CardTitle>
          <CardDescription>모든 정보를 하나의 화면에서 입력하고 저장하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">상품명 *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(event) => setFormField("name", event.target.value)}
                  placeholder="상품명을 입력하세요"
                />
                {fieldErrors.name ? <p className="text-xs text-destructive">{fieldErrors.name}</p> : null}
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
                {fieldErrors.category ? <p className="text-xs text-destructive">{fieldErrors.category}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">판매가 *</Label>
                <Input
                  id="price"
                  type="number"
                  min={1}
                  value={form.price}
                  onChange={(event) => setFormField("price", event.target.value)}
                  placeholder="3900"
                />
                {fieldErrors.price ? <p className="text-xs text-destructive">{fieldErrors.price}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">재고 *</Label>
                <Input
                  id="stock"
                  type="number"
                  min={0}
                  step={1}
                  value={form.stock}
                  onChange={(event) => setFormField("stock", event.target.value)}
                  placeholder="120"
                />
                {fieldErrors.stock ? <p className="text-xs text-destructive">{fieldErrors.stock}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">상태</Label>
                <Select value={form.status} onValueChange={(value) => setFormField("status", value as ProductStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">draft</SelectItem>
                    <SelectItem value="published">published</SelectItem>
                    <SelectItem value="scheduled">scheduled</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.status ? <p className="text-xs text-destructive">{fieldErrors.status}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="badge">뱃지</Label>
                <Select
                  value={form.badge}
                  onValueChange={(value) => setFormField("badge", value as ProductBadge | "none")}
                >
                  <SelectTrigger id="badge">
                    <SelectValue placeholder="none" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">none</SelectItem>
                    <SelectItem value="NEW">NEW</SelectItem>
                    <SelectItem value="HOT">HOT</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.badge ? <p className="text-xs text-destructive">{fieldErrors.badge}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="originalPrice">정가 (선택)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  min={1}
                  value={form.originalPrice}
                  onChange={(event) => setFormField("originalPrice", event.target.value)}
                  placeholder="5900"
                />
                {fieldErrors.originalPrice ? (
                  <p className="text-xs text-destructive">{fieldErrors.originalPrice}</p>
                ) : null}
              </div>

              <div className="flex items-end">
                <label htmlFor="isActive" className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Checkbox
                    id="isActive"
                    checked={form.isActive}
                    onCheckedChange={(checked) => setFormField("isActive", Boolean(checked))}
                  />
                  활성화
                </label>
              </div>
            </div>

            <div className="space-y-4 rounded-md border border-border p-4">
              <h2 className="text-base font-semibold">이미지 업로드</h2>

              <div className="space-y-2">
                <Label htmlFor="main-image">대표 이미지 (선택)</Label>
                <Input id="main-image" type="file" accept="image/*" onChange={handleMainImageChange} />
                <p className="text-xs text-muted-foreground">이미지 파일을 선택해 대표 이미지를 등록하세요.</p>
                {fieldErrors.image ? <p className="text-xs text-destructive">{fieldErrors.image}</p> : null}
                {imagePreviews.main ? (
                  <div className="rounded-md border border-border bg-muted/30 p-4">
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
                      onClick={() => {
                        setImages((prev) => ({ ...prev, main: null }))
                        setImagePreviews((prev) => ({ ...prev, main: null }))
                        setPrimaryImageCompression(null)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      대표 이미지 제거
                    </Button>
                    {renderCompressionInfo(primaryImageCompression)}
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
                  accept="image/*"
                  disabled={additionalCount >= 9}
                  onChange={handleAdditionalImagesChange}
                />
                <p className="text-xs text-muted-foreground">파일을 여러 개 선택할 수 있으며, 최대 9개까지 등록됩니다.</p>
                {fieldErrors.additionalImages ? (
                  <p className="text-xs text-destructive">{fieldErrors.additionalImages}</p>
                ) : null}

                {additionalCount === 0 ? (
                  <div className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
                    추가 이미지는 최대 9개까지 등록할 수 있습니다.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {imagePreviews.additional.map((imageUrl, index) => (
                      <div key={`${imageUrl}-${index}`} className="rounded-md border border-border p-3">
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
                        <p className="mt-2 truncate text-xs text-muted-foreground">추가 이미지 {index + 1}</p>
                        {renderCompressionInfo(additionalImageCompressions[imageUrl] ?? null)}
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
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="detail-image">상세설명 이미지 (선택)</Label>
                <Input
                  id="detail-image"
                  type="file"
                  accept="image/*"
                  onChange={handleDetailImageChange}
                />
                <p className="text-xs text-muted-foreground">세로로 긴 상세설명 이미지를 등록할 수 있습니다.</p>
                {fieldErrors.detailDescriptionImage ? (
                  <p className="text-xs text-destructive">{fieldErrors.detailDescriptionImage}</p>
                ) : null}
                {imagePreviews.detail ? (
                  <div className="rounded-md border border-border bg-muted/30 p-3">
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
                      onClick={() => {
                        setImages((prev) => ({ ...prev, detail: null }))
                        setImagePreviews((prev) => ({ ...prev, detail: null }))
                        setDetailImageCompression(null)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      상세설명 이미지 제거
                    </Button>
                    {renderCompressionInfo(detailImageCompression)}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">상세설명용 긴 이미지를 업로드하세요.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 rounded-md border border-border p-4">
              <h2 className="text-base font-semibold">배송</h2>

              <div className="space-y-2">
                <Label htmlFor="shipping-method">배송 방식</Label>
                <Select defaultValue="normal">
                  <SelectTrigger id="shipping-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">일반배송</SelectItem>
                    <SelectItem value="fast">빠른배송</SelectItem>
                    <SelectItem value="pickup">매장픽업</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="shipping-fee">배송비 (원)</Label>
                  <Input
                    id="shipping-fee"
                    type="number"
                    defaultValue={3000}
                    placeholder="3000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="free-shipping-threshold">무료배송 조건 (원)</Label>
                  <Input
                    id="free-shipping-threshold"
                    type="number"
                    defaultValue={30000}
                    placeholder="30000"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-md border border-border p-4">
              <h2 className="text-base font-semibold">상세 정보</h2>

              <div className="space-y-2">
                <Label htmlFor="description">상품 설명</Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="상품 설명을 입력하세요..."
                />
              </div>

              <div className="space-y-2">
                <Label>상세 스펙</Label>
                <div className="space-y-2">
                  {[
                    { label: "소재", placeholder: "예: ABS 플라스틱" },
                    { label: "크기", placeholder: "예: 120 x 80 x 50mm" },
                    { label: "무게", placeholder: "예: 150g" },
                  ].map((spec) => (
                    <div key={spec.label} className="flex gap-2">
                      <Input value={spec.label} className="w-28" readOnly />
                      <Input placeholder={spec.placeholder} className="flex-1" />
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm">
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    스펙 항목 추가
                  </Button>
                </div>
              </div>
            </div>

            {mutation.isPending && progressEntries.length > 0 ? (
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
