"use client"

import { useState, useMemo } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Copy,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  X,
  ImageIcon,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockProducts } from "@/lib/mock-data"
import type { Product } from "@/lib/types"

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
const categories = ["전체", "차량용품", "생활용품", "주방용품", "전자기기", "뷰티"]

export function ProductsManage() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("전체")
  const [statusFilter, setStatusFilter] = useState("전체")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
      const matchCategory = categoryFilter === "전체" || p.category === categoryFilter
      const matchStatus = statusFilter === "전체" || p.status === statusFilter
      return matchSearch && matchCategory && matchStatus
    })
  }, [products, search, categoryFilter, statusFilter])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const allSelected = paged.length > 0 && paged.every((p) => selectedIds.includes(p.id))

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(selectedIds.filter((id) => !paged.find((p) => p.id === id)))
    } else {
      setSelectedIds([...new Set([...selectedIds, ...paged.map((p) => p.id)])])
    }
  }

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleCreate = () => {
    const newProduct: Product = {
      id: `p-${Date.now()}`,
      name: "",
      category: "",
      price: 0,
      image: "",
      rating: 0,
      reviewCount: 0,
      sku: "",
      isActive: false,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "admin",
      updatedBy: "admin",
    }
    setEditProduct(newProduct)
    setIsDialogOpen(true)
  }

  const handleEdit = (product: Product) => {
    setEditProduct({ ...product })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!editProduct) return
    const exists = products.find((p) => p.id === editProduct.id)
    if (exists) {
      setProducts(products.map((p) => (p.id === editProduct.id ? { ...editProduct, updatedAt: new Date().toISOString() } : p)))
    } else {
      setProducts([...products, editProduct])
    }
    setIsDialogOpen(false)
    setEditProduct(null)
  }

  const handleDelete = (id: string) => {
    setProducts(products.filter((p) => p.id !== id))
    setSelectedIds(selectedIds.filter((x) => x !== id))
  }

  const handleBulkDelete = () => {
    setProducts(products.filter((p) => !selectedIds.includes(p.id)))
    setSelectedIds([])
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">상품 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {"전체 상품을 조회, 등록, 수정, 삭제할 수 있습니다."}
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
          <Button size="sm" onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-1" />
            상품 등록
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1.5 block">검색</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="상품명 또는 SKU로 검색..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                />
              </div>
            </div>
            <div className="w-full md:w-40">
              <Label className="text-xs text-muted-foreground mb-1.5 block">카테고리</Label>
              <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1) }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-32">
              <Label className="text-xs text-muted-foreground mb-1.5 block">상태</Label>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
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
          <Button variant="outline" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="h-3.5 w-3.5 mr-1" />
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
                <TableHead className="hidden md:table-cell">SKU</TableHead>
                <TableHead className="hidden lg:table-cell">평점</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ImageIcon className="h-8 w-8" />
                      <span>{"검색 결과가 없습니다."}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(product.id)}
                        onCheckedChange={() => toggleOne(product.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
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
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">{product.sku}</code>
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
            전체 {filtered.length}개 중 {(page - 1) * ITEMS_PER_PAGE + 1}-
            {Math.min(page * ITEMS_PER_PAGE, filtered.length)}개 표시
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editProduct && products.find((p) => p.id === editProduct.id) ? "상품 수정" : "상품 등록"}
            </DialogTitle>
            <DialogDescription>상품 기본 정보를 입력하세요.</DialogDescription>
          </DialogHeader>
          {editProduct && (
            <Tabs defaultValue="basic">
              <TabsList className="w-full">
                <TabsTrigger value="basic" className="flex-1">기본 정보</TabsTrigger>
                <TabsTrigger value="price" className="flex-1">가격/배송</TabsTrigger>
                <TabsTrigger value="detail" className="flex-1">상세 정보</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">상품명 *</Label>
                  <Input
                    id="name"
                    value={editProduct.name}
                    onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                    placeholder="상품명을 입력하세요"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={editProduct.sku}
                      onChange={(e) => setEditProduct({ ...editProduct, sku: e.target.value })}
                      placeholder="CAR-XX-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>카테고리 *</Label>
                    <Select
                      value={editProduct.category}
                      onValueChange={(v) => setEditProduct({ ...editProduct, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter((c) => c !== "전체").map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>대표 이미지</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {"이미지를 드래그하거나 클릭하여 업로드하세요"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG 최대 2MB</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>뱃지</Label>
                  <Select
                    value={editProduct.badge || "none"}
                    onValueChange={(v) => setEditProduct({ ...editProduct, badge: v === "none" ? undefined : v })}
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
              </TabsContent>
              <TabsContent value="price" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">판매가 (원) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={editProduct.price}
                      onChange={(e) => setEditProduct({ ...editProduct, price: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">정가 (원)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={editProduct.originalPrice || ""}
                      onChange={(e) =>
                        setEditProduct({
                          ...editProduct,
                          originalPrice: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                </div>
                {editProduct.price > 0 && editProduct.originalPrice && editProduct.originalPrice > editProduct.price && (
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <p className="text-sm text-foreground">
                      할인율:{" "}
                      <span className="font-bold text-red-600">
                        {Math.round(((editProduct.originalPrice - editProduct.price) / editProduct.originalPrice) * 100)}%
                      </span>
                      {" | "}할인액: <span className="font-bold">{formatPrice(editProduct.originalPrice - editProduct.price)}</span>
                    </p>
                  </div>
                )}
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>배송비 (원)</Label>
                    <Input type="number" defaultValue={3000} />
                  </div>
                  <div className="space-y-2">
                    <Label>무료배송 조건 (원)</Label>
                    <Input type="number" defaultValue={30000} placeholder="30000" />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="detail" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>상품 설명</Label>
                  <Textarea
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
                    <Button variant="outline" size="sm">
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      스펙 항목 추가
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>발행 상태</Label>
                  <Select
                    value={editProduct.status}
                    onValueChange={(v) => setEditProduct({ ...editProduct, status: v as Product["status"] })}
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
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button variant="outline">임시저장</Button>
            <Button onClick={handleSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
