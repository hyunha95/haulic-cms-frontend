"use client"

import { ChevronRight, Plus, ImageIcon, Search, Trash2 } from "lucide-react"
import { useEffect, useMemo, useState, type ChangeEvent } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  findCategoryPathIdsByValue,
  getCategoryPathNamesByIds,
  joinCategoryPath,
} from "@/lib/product-categories-storage"
import { cn } from "@/lib/utils"
import type { ProductCategoryNode } from "@/lib/product-categories-storage"
import type { Product } from "@/lib/types"

interface ProductFormFieldsProps {
  product: Product
  categoryTree: ProductCategoryNode[]
  onChange: (nextProduct: Product) => void
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

function findNodeById(nodes: ProductCategoryNode[], id: string) {
  return nodes.find((node) => node.id === id)
}

export function ProductFormFields({ product, categoryTree, onChange }: ProductFormFieldsProps) {
  const [selectedPathIds, setSelectedPathIds] = useState<string[]>([])
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null)
  const [primaryImageCompression, setPrimaryImageCompression] = useState<ImageCompressionResult | null>(null)
  const [additionalImageCompressions, setAdditionalImageCompressions] = useState<Record<string, ImageCompressionResult>>({})
  const [detailImageCompression, setDetailImageCompression] = useState<ImageCompressionResult | null>(null)

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

    if (file.type === "image/gif" || file.type === "image/svg+xml") {
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

      const outputType = file.type === "image/png" || file.type === "image/webp"
        ? "image/webp"
        : "image/jpeg"
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

  const formatImageBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    return `${(kb / 1024).toFixed(2)} MB`
  }

  const formatImageDimensions = (stats: ImageStats) => `${stats.width} x ${stats.height}px`

  const renderCompressionInfo = (data: ImageCompressionResult | null) => {
    if (!data) return null

    const savedPercent =
      data.original.bytes > 0
        ? Math.max(0, Math.round((1 - data.compressed.bytes / data.original.bytes) * 100))
        : 0

    return (
      <div className="mt-2 rounded-md border border-border/70 bg-background/70 p-2 text-[11px] text-muted-foreground">
        <p className="font-medium text-foreground/90">이미지 정보</p>
        <p>원본: {formatImageDimensions(data.original)} / {formatImageBytes(data.original.bytes)}</p>
        <p>
          압축: {formatImageDimensions(data.compressed)} / {formatImageBytes(data.compressed.bytes)}{" "}
          ({data.usedCompressed ? `${savedPercent}% 감소` : "원본 유지"})
        </p>
      </div>
    )
  }

  useEffect(() => {
    const pathIds = findCategoryPathIdsByValue(categoryTree, product.category).slice(0, 4)
    setSelectedPathIds(pathIds)
  }, [categoryTree, product.category])

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

  const handleSelectDepth = (depth: number, nodeId: string) => {
    const nextPathIds = [...selectedPathIds.slice(0, depth - 1), nodeId]
    setSelectedPathIds(nextPathIds)

    const pathNames = getCategoryPathNamesByIds(categoryTree, nextPathIds)
    onChange({
      ...product,
      category: joinCategoryPath(pathNames),
    })
  }

  const selectedPathLabel = getCategoryPathNamesByIds(categoryTree, selectedPathIds).join(" > ")
  const additionalImages = product.additionalImages ?? []

  const handleRemoveAdditionalImage = (targetIndex: number) => {
    const targetImageUrl = additionalImages[targetIndex]
    if (targetImageUrl) {
      setAdditionalImageCompressions((prev) => {
        const next = { ...prev }
        delete next[targetImageUrl]
        return next
      })
    }

    onChange({
      ...product,
      additionalImages: additionalImages.filter((_, index) => index !== targetIndex),
    })
  }

  const handlePrimaryImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const imageResult = await readImageFile(file)
      setPrimaryImageCompression(imageResult)
      onChange({
        ...product,
        image: imageResult.imageData,
      })
    } finally {
      event.target.value = ""
    }
  }

  const handleAdditionalImagesChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    const availableSlots = Math.max(0, 9 - additionalImages.length)
    if (availableSlots === 0) {
      event.target.value = ""
      return
    }

    try {
      const selectedFiles = files.slice(0, availableSlots)
      const uploadedResults = await Promise.all(selectedFiles.map((file) => readImageFile(file)))
      const uploadedImages = uploadedResults.map((item) => item.imageData)
      const uniqueImages = Array.from(new Set([...additionalImages, ...uploadedImages])).slice(0, 9)

      setAdditionalImageCompressions((prev) => {
        const next = { ...prev }
        for (const result of uploadedResults) {
          next[result.imageData] = result
        }
        for (const key of Object.keys(next)) {
          if (!uniqueImages.includes(key)) {
            delete next[key]
          }
        }
        return next
      })

      onChange({
        ...product,
        additionalImages: uniqueImages,
      })
    } finally {
      event.target.value = ""
    }
  }

  const handleDetailDescriptionImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const imageResult = await readImageFile(file)
      setDetailImageCompression(imageResult)
      onChange({
        ...product,
        detailDescriptionImage: imageResult.imageData,
      })
    } finally {
      event.target.value = ""
    }
  }

  const handleOpenImagePreview = (src: string, alt: string) => {
    setPreviewImage({ src, alt })
  }

  const handlePreviewDialogOpenChange = (open: boolean) => {
    if (!open) {
      setPreviewImage(null)
    }
  }

  return (
    <>
      <div className="space-y-8">
        <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">기본 정보</h2>
        <div className="space-y-2">
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
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">상품명 *</Label>
          <Input
            id="name"
            value={product.name}
            onChange={(e) => onChange({ ...product, name: e.target.value })}
            placeholder="상품명을 입력하세요"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">판매가 (원) *</Label>
          <Input
            id="price"
            type="number"
            value={product.price}
            onChange={(e) => onChange({ ...product, price: Number(e.target.value) })}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="stock">재고 수량 *</Label>
            <Input
              id="stock"
              type="number"
              min={0}
              value={product.stock}
              onChange={(e) => onChange({ ...product, stock: Number(e.target.value) })}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label>뱃지</Label>
            <Select
              value={product.badge || "none"}
              onValueChange={(value) =>
                onChange({ ...product, badge: value === "none" ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="없음" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">없음</SelectItem>
                <SelectItem value="NEW">NEW</SelectItem>
                <SelectItem value="HOT">HOT</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="image-upload">대표 이미지</Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handlePrimaryImageChange}
            />
            <p className="text-xs text-muted-foreground">이미지 파일을 선택해 대표 이미지를 등록하세요. 업로드 시 자동으로 압축됩니다.</p>
            {product.image.trim().length > 0 ? (
              <div className="rounded-md border border-border bg-muted/30 p-4">
                <div className="relative h-56 overflow-hidden rounded-md bg-muted">
                  <img
                    src={product.image}
                    alt="대표 이미지 미리보기"
                    className="h-full w-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8 border border-border bg-background/90 backdrop-blur-sm hover:bg-background"
                    onClick={() =>
                      handleOpenImagePreview(product.image, "대표 이미지 미리보기")
                    }
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
                    setPrimaryImageCompression(null)
                    onChange({ ...product, image: "" })
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
                <p className="text-sm text-muted-foreground mt-2">
                  대표 이미지를 업로드하세요.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="additional-images-upload">추가 이미지</Label>
              <span className="text-xs text-muted-foreground">{additionalImages.length}/9</span>
            </div>
            <Input
              id="additional-images-upload"
              type="file"
              accept="image/*"
              multiple
              disabled={additionalImages.length >= 9}
              onChange={handleAdditionalImagesChange}
            />
            <p className="text-xs text-muted-foreground">
              파일을 여러 개 선택할 수 있으며, 최대 9개까지 등록되며 업로드 시 자동 압축됩니다.
            </p>

            {additionalImages.length === 0 ? (
              <div className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
                추가 이미지는 최대 9개까지 등록할 수 있습니다.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {additionalImages.map((imageUrl, index) => (
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
                        onClick={() =>
                          handleOpenImagePreview(imageUrl, `추가 이미지 ${index + 1} 미리보기`)
                        }
                        aria-label={`추가 이미지 ${index + 1} 확대 보기`}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-2 truncate text-xs text-muted-foreground">
                      추가 이미지 {index + 1}
                    </p>
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
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">배송</h2>
        <div className="space-y-2">
          <Label>배송 방식</Label>
          <Select defaultValue="normal">
            <SelectTrigger>
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
            <Label>배송비 (원)</Label>
            <Input type="number" defaultValue={3000} />
          </div>
          <div className="space-y-2">
            <Label>무료배송 조건 (원)</Label>
            <Input type="number" defaultValue={30000} placeholder="30000" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">상세 정보</h2>
        <div className="space-y-2">
          <Label htmlFor="detail-description-image-upload">상세설명 이미지</Label>
          <Input
            id="detail-description-image-upload"
            type="file"
            accept="image/*"
            onChange={handleDetailDescriptionImageChange}
          />
          <p className="text-xs text-muted-foreground">
            세로로 긴 상세설명 이미지를 등록할 수 있으며 업로드 시 자동 압축됩니다.
          </p>
          {product.detailDescriptionImage && product.detailDescriptionImage.trim().length > 0 ? (
            <div className="rounded-md border border-border bg-muted/30 p-3">
              <div className="max-h-[420px] overflow-auto rounded-md bg-muted p-2">
                <img
                  src={product.detailDescriptionImage}
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
                  setDetailImageCompression(null)
                  onChange({ ...product, detailDescriptionImage: "" })
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
              <p className="text-sm text-muted-foreground mt-2">
                상세설명용 긴 이미지를 업로드하세요.
              </p>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label>상품 설명</Label>
          <Textarea rows={4} placeholder="상품 설명을 입력하세요..." />
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
            <Button variant="outline" size="sm">
              <Plus className="h-3.5 w-3.5 mr-1" />
              스펙 항목 추가
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>발행 상태</Label>
          <Select
            value={product.status}
            onValueChange={(value) => onChange({ ...product, status: value as Product["status"] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">초안</SelectItem>
              <SelectItem value="published">발행</SelectItem>
              <SelectItem value="scheduled">예약 발행</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      </div>

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
          <p className="text-xs text-muted-foreground">
            이미지가 팝업 크기를 넘지 않도록 자동으로 맞춰 표시됩니다.
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}
