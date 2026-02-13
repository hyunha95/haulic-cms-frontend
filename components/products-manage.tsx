"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useMemo, useEffect } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  MoreHorizontal,
  Eye,
  Copy,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  X,
  ImageIcon,
  AlertCircle, Loader2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  DEFAULT_PRODUCT_CATEGORY_TREE,
  flattenCategoryTree,
  readProductCategoryTreeFromStorage,
} from "@/lib/product-categories-storage"
import { useProducts, useDeleteProduct, useBulkDeleteProducts } from "@/hooks/use-products"
import type { ProductResponse } from "@/lib/types"

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { label: string; className: string }> = {
    published: { label: "발행됨", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    draft: { label: "초안", className: "bg-amber-100 text-amber-700 border-amber-200" },
    scheduled: { label: "예약", className: "bg-blue-100 text-blue-700 border-blue-200" },
  }
  const v = variants[status] || variants.draft
  return <Badge variant="outline" className={v.className}>{v.label}</Badge>
}

function ProductBadge({ badge }: { badge?: string }) {
  if (!badge) return null
  const map: Record<string, string> = {
    HOT: "bg-red-100 text-red-700 border-red-200",
    NEW: "bg-blue-100 text-blue-700 border-blue-200",
  }
  return <Badge variant="outline" className={map[badge] || ""}>{badge}</Badge>
}

function formatPrice(value: number) {
  return value.toLocaleString() + "원"
}

const ITEMS_PER_PAGE = 10

export function ProductsManage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("전체")
  const [statusFilter, setStatusFilter] = useState("전체")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(0) // 백엔드는 0-based 인덱스
  const [categoryTree, setCategoryTree] = useState(DEFAULT_PRODUCT_CATEGORY_TREE)

  useEffect(() => {
    const storedCategoryTree = readProductCategoryTreeFromStorage()
    if (storedCategoryTree && storedCategoryTree.length > 0) {
      setCategoryTree(storedCategoryTree)
    }
  }, [])

  // API 호출
  const { data: productsPage, isLoading, error, refetch } = useProducts({
    name: search || undefined,
    category: categoryFilter !== "전체" ? categoryFilter : undefined,
    page,
    size: ITEMS_PER_PAGE,
    sort: "createdAt",
    direction: "DESC",
  })

  const deleteMutation = useDeleteProduct()
  const bulkDeleteMutation = useBulkDeleteProducts()

  const products = productsPage?.content ?? []
  const totalPages = productsPage?.totalPages ?? 0
  const totalElements = productsPage?.totalElements ?? 0

  const filterCategories = useMemo(() => {
    const values: string[] = []

    const pushUnique = (value: string) => {
      const normalized = value.trim()
      if (!normalized) return
      if (values.includes(normalized)) return
      values.push(normalized)
    }

    for (const item of flattenCategoryTree(categoryTree)) {
      pushUnique(item.value)
    }

    for (const product of products) {
      pushUnique(product.category)
    }

    return ["전체", ...values]
  }, [categoryTree, products])

  // 클라이언트 측 상태 필터링 (status는 아직 백엔드에서 지원 안함)
  const filteredProducts = useMemo(() => {
    if (statusFilter === "전체") return products
    return products.filter((p) => p.status === statusFilter)
  }, [products, statusFilter])

  const allSelected = filteredProducts.length > 0 && filteredProducts.every((p) => selectedIds.includes(p.id))

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id))
    }
  }

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleEdit = (product: ProductResponse) => {
    router.push(`/products/${product.id}/edit`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return

    try {
      await deleteMutation.mutateAsync(id)
      setSelectedIds(selectedIds.filter((x) => x !== id))
    } catch (error) {
      console.error("Failed to delete product:", error)
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`${selectedIds.length}개 상품을 삭제하시겠습니까?`)) return

    try {
      await bulkDeleteMutation.mutateAsync(selectedIds)
      setSelectedIds([])
    } catch (error) {
      console.error("Failed to bulk delete products:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">상품 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            전체 {totalElements}개 상품을 조회, 등록, 수정, 삭제할 수 있습니다.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            내보내기
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-1" />
            가져오기
          </Button>
          <Button size="sm" asChild>
            <Link href="/products/new">
              <Plus className="h-4 w-4 mr-1" />
              상품 등록
            </Link>
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>
            {error.message}
            <Button variant="outline" size="sm" className="ml-2" onClick={() => refetch()}>
              다시 시도
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1.5 block">검색</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="상품명으로 검색..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(0)
                  }}
                />
              </div>
            </div>
            <div className="w-full md:w-40">
              <Label className="text-xs text-muted-foreground mb-1.5 block">카테고리</Label>
              <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(0) }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filterCategories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-32">
              <Label className="text-xs text-muted-foreground mb-1.5 block">상태</Label>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0) }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체</SelectItem>
                  <SelectItem value="published">발행됨</SelectItem>
                  <SelectItem value="draft">초안</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <span className="text-sm font-medium text-foreground">
            {selectedIds.length}개 선택됨
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkDelete}
            disabled={bulkDeleteMutation.isPending}
          >
            {bulkDeleteMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5 mr-1" />
            )}
            일괄 삭제
          </Button>
          <Button variant="outline" size="sm">
            발행 상태 변경
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
            <X className="h-3.5 w-3.5 mr-1" />
            선택 해제
          </Button>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                </TableHead>
                <TableHead>상품</TableHead>
                <TableHead className="hidden md:table-cell">카테고리</TableHead>
                <TableHead>가격</TableHead>
                <TableHead className="hidden md:table-cell">재고</TableHead>
                <TableHead className="hidden lg:table-cell">평점</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span>로딩 중...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ImageIcon className="h-8 w-8" />
                      <span>검색 결과가 없습니다.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(product.id)}
                        onCheckedChange={() => toggleOne(product.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">{product.name}</p>
                          <div className="flex gap-1 mt-0.5">
                            <ProductBadge badge={product.badge} />
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">{product.category}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{formatPrice(product.price)}</p>
                        {product.originalPrice && (
                          <p className="text-xs text-muted-foreground line-through">
                            {formatPrice(product.originalPrice)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-foreground">{product.stock ?? 0}개</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-amber-500">{"★"}</span>
                        <span className="text-foreground">{product.rating}</span>
                        <span className="text-muted-foreground">({product.reviewCount})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={product.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(product)}>
                            <Pencil className="h-3.5 w-3.5 mr-2" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="h-3.5 w-3.5 mr-2" />
                            미리보기
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-3.5 w-3.5 mr-2" />
                            복제
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            전체 {totalElements}개 중 {page * ITEMS_PER_PAGE + 1}-
            {Math.min((page + 1) * ITEMS_PER_PAGE, totalElements)}개 표시
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              disabled={page <= 0}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage(p)}
              >
                {p + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

    </div>
  )
}
