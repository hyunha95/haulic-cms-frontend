"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Grid3X3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { mockPromoTiles } from "@/lib/mock-data"
import type { PromoTile } from "@/lib/types"

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { label: string; className: string }> = {
    published: { label: "발행됨", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    draft: { label: "초안", className: "bg-amber-100 text-amber-700 border-amber-200" },
  }
  const v = variants[status] || variants.draft
  return <Badge variant="outline" className={v.className}>{v.label}</Badge>
}

export function PromoManage() {
  const [tiles, setTiles] = useState<PromoTile[]>(mockPromoTiles)
  const [editTile, setEditTile] = useState<PromoTile | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleCreate = () => {
    const newTile: PromoTile = {
      id: `pt-${Date.now()}`, type: "product", row: 1, col: 1, title: "", image: "", linkUrl: "",
      sortOrder: tiles.length + 1, status: "draft", createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(), createdBy: "admin", updatedBy: "admin",
    }
    setEditTile(newTile)
    setIsOpen(true)
  }

  const handleSave = () => {
    if (!editTile) return
    const exists = tiles.find((t) => t.id === editTile.id)
    if (exists) {
      setTiles(tiles.map((t) => (t.id === editTile.id ? { ...editTile, updatedAt: new Date().toISOString() } : t)))
    } else {
      setTiles([...tiles, editTile])
    }
    setIsOpen(false)
    setEditTile(null)
  }

  const handleDelete = (id: string) => setTiles(tiles.filter((t) => t.id !== id))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">프로모 그리드 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {"홈 화면 프로모 그리드 타일(배너/상품 믹스)을 관리합니다."}
          </p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1" />
          타일 추가
        </Button>
      </div>

      {/* Grid Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            그리드 미리보기
          </CardTitle>
          <CardDescription>현재 등록된 타일의 그리드 배치를 확인합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 max-w-xl">
            {tiles.sort((a, b) => a.sortOrder - b.sortOrder).map((tile) => (
              <div
                key={tile.id}
                className={`rounded-lg border border-border p-3 ${
                  tile.type === "banner" ? "bg-primary/5" : "bg-muted"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-[10px]">
                    {tile.type === "banner" ? "배너" : "상품"}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">R{tile.row}C{tile.col}</span>
                </div>
                <p className="text-xs font-medium text-foreground truncate">{tile.title || "제목 없음"}</p>
                {tile.price && (
                  <p className="text-xs text-primary font-semibold mt-0.5">{tile.price.toLocaleString()}원</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>타입</TableHead>
                <TableHead>제목</TableHead>
                <TableHead>위치</TableHead>
                <TableHead className="hidden md:table-cell">가격</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiles.sort((a, b) => a.sortOrder - b.sortOrder).map((tile) => (
                <TableRow key={tile.id}>
                  <TableCell>
                    <Badge variant={tile.type === "banner" ? "default" : "secondary"} className="text-xs">
                      {tile.type === "banner" ? "배너" : "상품"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{tile.title}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">행{tile.row} 열{tile.col}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {tile.price ? `${tile.price.toLocaleString()}원` : "-"}
                  </TableCell>
                  <TableCell><StatusBadge status={tile.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditTile({ ...tile }); setIsOpen(true) }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(tile.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editTile && tiles.find((t) => t.id === editTile.id) ? "타일 수정" : "타일 추가"}</DialogTitle>
            <DialogDescription>프로모 그리드 타일 정보를 입력하세요.</DialogDescription>
          </DialogHeader>
          {editTile && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>타일 타입</Label>
                <Select value={editTile.type} onValueChange={(val) => setEditTile({ ...editTile, type: val as "banner" | "product" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">배너</SelectItem>
                    <SelectItem value="product">상품</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>제목 *</Label>
                <Input value={editTile.title} onChange={(e) => setEditTile({ ...editTile, title: e.target.value })} />
              </div>
              {editTile.type === "banner" && (
                <div className="space-y-2">
                  <Label>부제</Label>
                  <Input value={editTile.subtitle || ""} onChange={(e) => setEditTile({ ...editTile, subtitle: e.target.value })} />
                </div>
              )}
              {editTile.type === "product" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>판매가 (원)</Label>
                    <Input type="number" value={editTile.price || ""} onChange={(e) => setEditTile({ ...editTile, price: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>원가 (원)</Label>
                    <Input type="number" value={editTile.originalPrice || ""} onChange={(e) => setEditTile({ ...editTile, originalPrice: Number(e.target.value) })} />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>행 번호</Label>
                  <Input type="number" value={editTile.row} onChange={(e) => setEditTile({ ...editTile, row: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>열 번호</Label>
                  <Input type="number" value={editTile.col} onChange={(e) => setEditTile({ ...editTile, col: Number(e.target.value) })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>이미지 URL</Label>
                <Input value={editTile.image} onChange={(e) => setEditTile({ ...editTile, image: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>링크 URL</Label>
                <Input value={editTile.linkUrl} onChange={(e) => setEditTile({ ...editTile, linkUrl: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>취소</Button>
            <Button onClick={handleSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
