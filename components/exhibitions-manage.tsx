"use client"

import { useState } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  MoreHorizontal,
  Copy,
  ExternalLink,
  Tag,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { mockExhibitions } from "@/lib/mock-data"
import type { ExhibitionPage } from "@/lib/types"

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { label: string; className: string }> = {
    published: { label: "발행됨", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    draft: { label: "초안", className: "bg-amber-100 text-amber-700 border-amber-200" },
    scheduled: { label: "예약", className: "bg-blue-100 text-blue-700 border-blue-200" },
  }
  const v = variants[status] || variants.draft
  return <Badge variant="outline" className={v.className}>{v.label}</Badge>
}

export function ExhibitionsManage() {
  const [exhibitions, setExhibitions] = useState<ExhibitionPage[]>(mockExhibitions)
  const [editItem, setEditItem] = useState<ExhibitionPage | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleCreate = () => {
    const newItem: ExhibitionPage = {
      id: `ex-${Date.now()}`,
      title: "",
      slug: "",
      breadcrumb: ["홈", "기획전"],
      filterSubcategories: [],
      sortOptions: ["추천순", "최신순", "가격낮은순", "가격높은순"],
      priceFilters: ["전체"],
      deliveryFilters: ["전체"],
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "admin",
      updatedBy: "admin",
    }
    setEditItem(newItem)
    setIsDialogOpen(true)
  }

  const handleEdit = (item: ExhibitionPage) => {
    setEditItem({ ...item })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!editItem) return
    const exists = exhibitions.find((e) => e.id === editItem.id)
    if (exists) {
      setExhibitions(exhibitions.map((e) => (e.id === editItem.id ? { ...editItem, updatedAt: new Date().toISOString() } : e)))
    } else {
      setExhibitions([...exhibitions, editItem])
    }
    setIsDialogOpen(false)
    setEditItem(null)
  }

  const handleDelete = (id: string) => {
    setExhibitions(exhibitions.filter((e) => e.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">기획전/카테고리 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {"기획전 페이지와 카테고리 필터를 관리합니다."}
          </p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1" />
          기획전 추가
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Tag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{exhibitions.length}</p>
                <p className="text-xs text-muted-foreground">전체 기획전</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <Eye className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {exhibitions.filter((e) => e.status === "published").length}
                </p>
                <p className="text-xs text-muted-foreground">운영 중</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <Pencil className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {exhibitions.filter((e) => e.status === "draft").length}
                </p>
                <p className="text-xs text-muted-foreground">초안</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>기획전명</TableHead>
                <TableHead>슬러그</TableHead>
                <TableHead className="hidden md:table-cell">서브카테고리</TableHead>
                <TableHead className="hidden md:table-cell">정렬옵션</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exhibitions.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-medium text-foreground text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.breadcrumb.join(" > ")}
                    </p>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">
                      /{item.slug}
                    </code>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {item.filterSubcategories.slice(0, 3).map((sub) => (
                        <Badge key={sub.id} variant="secondary" className="text-[10px]">
                          {sub.label} ({sub.count})
                        </Badge>
                      ))}
                      {item.filterSubcategories.length > 3 && (
                        <Badge variant="secondary" className="text-[10px]">
                          +{item.filterSubcategories.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {item.sortOptions.length}개
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                          <Pencil className="h-3.5 w-3.5 mr-2" />
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ExternalLink className="h-3.5 w-3.5 mr-2" />
                          프론트에서 보기
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-3.5 w-3.5 mr-2" />
                          복제
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editItem && exhibitions.find((e) => e.id === editItem.id) ? "기획전 수정" : "기획전 추가"}
            </DialogTitle>
            <DialogDescription>기획전 기본 정보와 필터를 설정하세요.</DialogDescription>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ex-title">기획전명 *</Label>
                <Input
                  id="ex-title"
                  value={editItem.title}
                  onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                  placeholder="기획전 제목을 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ex-slug">슬러그 *</Label>
                <Input
                  id="ex-slug"
                  value={editItem.slug}
                  onChange={(e) => setEditItem({ ...editItem, slug: e.target.value })}
                  placeholder="winter-car-care"
                />
                <p className="text-xs text-muted-foreground">
                  {"URL: /exhCtgr/"}{editItem.slug || "..."}
                </p>
              </div>
              <div className="space-y-2">
                <Label>발행 상태</Label>
                <Select
                  value={editItem.status}
                  onValueChange={(v) => setEditItem({ ...editItem, status: v as ExhibitionPage["status"] })}
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
              <div className="space-y-2">
                <Label>필터 서브카테고리</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {editItem.filterSubcategories.map((sub, i) => (
                    <div key={sub.id} className="flex gap-2 items-center">
                      <Input value={sub.label} className="flex-1" readOnly />
                      <Badge variant="secondary">{sub.count}</Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  서브카테고리 추가
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
