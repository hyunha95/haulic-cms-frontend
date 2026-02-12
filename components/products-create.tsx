"use client"

import Link from "next/link"
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react"

import { useCreateProductWithUploads } from "@/hooks/use-product-create"
import { mapFieldErrors, normalizeApiError } from "@/lib/api-error"
import type { ProductBadge, ProductStatus } from "@/lib/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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

  const setFormField = <K extends keyof ProductCreateFormState>(field: K, value: ProductCreateFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleMainImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setImages((prev) => ({ ...prev, main: file }))
    event.target.value = ""
  }

  const handleDetailImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setImages((prev) => ({ ...prev, detail: file }))
    event.target.value = ""
  }

  const handleAdditionalImagesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? [])
    if (selectedFiles.length === 0) {
      return
    }

    setImages((prev) => ({
      ...prev,
      additional: [...prev.additional, ...selectedFiles].slice(0, 9),
    }))
    event.target.value = ""
  }

  const handleRemoveAdditionalImage = (index: number) => {
    setImages((prev) => ({
      ...prev,
      additional: prev.additional.filter((_, currentIndex) => currentIndex !== index),
    }))
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">상품 등록</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Presign 업로드 후 이미지 URL을 포함해 상품을 생성합니다.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/products">상품 목록으로 이동</Link>
        </Button>
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
          <CardTitle>기본 정보</CardTitle>
          <CardDescription>필수 입력값과 이미지 파일을 지정한 뒤 저장하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                <Label htmlFor="category">카테고리 *</Label>
                <Input
                  id="category"
                  value={form.category}
                  onChange={(event) => setFormField("category", event.target.value)}
                  placeholder="예: Car > Interior > Diffuser"
                />
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
                <Input id="main-image" type="file" accept=".jpg,.jpeg,.png,.webp,image/*" onChange={handleMainImageChange} />
                <p className="text-xs text-muted-foreground">{formatFileName(images.main)}</p>
                {fieldErrors.image ? <p className="text-xs text-destructive">{fieldErrors.image}</p> : null}
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
                  accept=".jpg,.jpeg,.png,.webp,image/*"
                  disabled={additionalCount >= 9}
                  onChange={handleAdditionalImagesChange}
                />
                {fieldErrors.additionalImages ? (
                  <p className="text-xs text-destructive">{fieldErrors.additionalImages}</p>
                ) : null}
                {additionalCount > 0 ? (
                  <ul className="space-y-1">
                    {images.additional.map((file, index) => (
                      <li key={`${file.name}-${index}`} className="flex items-center justify-between text-sm">
                        <span className="truncate pr-3">{formatFileName(file)}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveAdditionalImage(index)}>
                          제거
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="detail-image">상세설명 이미지 (선택)</Label>
                <Input
                  id="detail-image"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/*"
                  onChange={handleDetailImageChange}
                />
                <p className="text-xs text-muted-foreground">{formatFileName(images.detail)}</p>
                {fieldErrors.detailDescriptionImage ? (
                  <p className="text-xs text-destructive">{fieldErrors.detailDescriptionImage}</p>
                ) : null}
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

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={!canSave || mutation.isPending}>
                {mutation.isPending ? "업로드 및 저장 중..." : "상품 저장"}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/products">취소</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
