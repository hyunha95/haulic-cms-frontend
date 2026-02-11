"use client"

import { useState } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  ChevronRight,
  Layers,
} from "lucide-react"
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
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { mockMegaMenuCategories } from "@/lib/mock-data"
import type { MegaMenuCategory, MegaMenuItem, PublishStatus } from "@/lib/types"

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { label: string; className: string }> = {
    published: { label: "발행됨", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    draft: { label: "초안", className: "bg-amber-100 text-amber-700 border-amber-200" },
  }
  const v = variants[status] || variants.draft
  return <Badge variant="outline" className={v.className}>{v.label}</Badge>
}

export function MegaMenuManage() {
  const [categories, setCategories] = useState<MegaMenuCategory[]>(mockMegaMenuCategories)
  const [editCat, setEditCat] = useState<MegaMenuCategory | null>(null)
  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false)
  const [editSubItem, setEditSubItem] = useState<{ catId: string; item: MegaMenuItem } | null>(null)
  const [isSubDialogOpen, setIsSubDialogOpen] = useState(false)
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(categories.map((c) => c.id)))

  const toggleExpand = (id: string) => {
    const next = new Set(expandedCats)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpandedCats(next)
  }

  // Category CRUD
  const handleCatCreate = () => {
    const now = new Date().toISOString()
    const newCat: MegaMenuCategory = {
      id: `mm-${Date.now()}`, title: "", sortOrder: categories.length + 1,
      items: [], status: "draft", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin",
    }
    setEditCat(newCat)
    setIsCatDialogOpen(true)
  }

  const handleCatSave = () => {
    if (!editCat) return
    const exists = categories.find((c) => c.id === editCat.id)
    if (exists) {
      setCategories(categories.map((c) => (c.id === editCat.id ? { ...editCat, updatedAt: new Date().toISOString() } : c)))
    } else {
      setCategories([...categories, editCat])
    }
    setIsCatDialogOpen(false)
    setEditCat(null)
  }

  const handleCatDelete = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id))
  }

  // Sub-item CRUD
  const handleSubCreate = (catId: string) => {
    const cat = categories.find((c) => c.id === catId)
    if (!cat) return
    const newItem: MegaMenuItem = {
      id: `mmi-${Date.now()}`, label: "", href: "/", sortOrder: cat.items.length + 1,
    }
    setEditSubItem({ catId, item: newItem })
    setIsSubDialogOpen(true)
  }

  const handleSubSave = () => {
    if (!editSubItem) return
    const { catId, item } = editSubItem
    setCategories(categories.map((c) => {
      if (c.id !== catId) return c
      const exists = c.items.find((i) => i.id === item.id)
      if (exists) {
        return { ...c, items: c.items.map((i) => (i.id === item.id ? item : i)), updatedAt: new Date().toISOString() }
      }
      return { ...c, items: [...c.items, item], updatedAt: new Date().toISOString() }
    }))
    setIsSubDialogOpen(false)
    setEditSubItem(null)
  }

  const handleSubDelete = (catId: string, itemId: string) => {
    setCategories(categories.map((c) => {
      if (c.id !== catId) return c
      return { ...c, items: c.items.filter((i) => i.id !== itemId) }
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">메가메뉴 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {"대분류 카테고리와 하위 메뉴 항목을 관리합니다."}
          </p>
        </div>
        <Button size="sm" onClick={handleCatCreate}>
          <Plus className="h-4 w-4 mr-1" />
          대분류 추가
        </Button>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4" />
            메가메뉴 미리보기
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg p-4 bg-card">
            <div className="flex gap-8">
              {categories
                .filter((c) => c.status === "published")
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((cat) => (
                  <div key={cat.id}>
                    <p className="text-sm font-semibold text-foreground mb-2">{cat.title}</p>
                    <div className="space-y-1">
                      {cat.items.sort((a, b) => a.sortOrder - b.sortOrder).map((item) => (
                        <p key={item.id} className="text-xs text-muted-foreground hover:text-primary cursor-pointer">
                          {item.label}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category List */}
      <div className="space-y-3">
        {categories.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {"등록된 메가메뉴 카테고리가 없습니다."}
            </CardContent>
          </Card>
        ) : (
          categories.sort((a, b) => a.sortOrder - b.sortOrder).map((cat) => (
            <Collapsible key={cat.id} open={expandedCats.has(cat.id)} onOpenChange={() => toggleExpand(cat.id)}>
              <Card>
                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between">
                    <CollapsibleTrigger className="flex items-center gap-3 hover:opacity-80">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${expandedCats.has(cat.id) ? "rotate-90" : ""}`} />
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{cat.title}</span>
                        <Badge variant="secondary" className="text-[10px]">{cat.items.length}개 항목</Badge>
                        <StatusBadge status={cat.status} />
                      </div>
                    </CollapsibleTrigger>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditCat({ ...cat }); setIsCatDialogOpen(true) }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleCatDelete(cat.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="pt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10" />
                          <TableHead>라벨</TableHead>
                          <TableHead>링크</TableHead>
                          <TableHead>순서</TableHead>
                          <TableHead className="text-right">작업</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cat.items.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-6 text-muted-foreground text-sm">
                              {"하위 항목이 없습니다."}
                            </TableCell>
                          </TableRow>
                        ) : (
                          cat.items.sort((a, b) => a.sortOrder - b.sortOrder).map((item) => (
                            <TableRow key={item.id}>
                              <TableCell><GripVertical className="h-3.5 w-3.5 text-muted-foreground cursor-grab" /></TableCell>
                              <TableCell className="font-medium text-foreground text-sm">{item.label}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{item.href}</TableCell>
                              <TableCell><Badge variant="secondary" className="text-[10px] tabular-nums">{item.sortOrder}</Badge></TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditSubItem({ catId: cat.id, item: { ...item } }); setIsSubDialogOpen(true) }}>
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleSubDelete(cat.id, item.id)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                    <div className="mt-3">
                      <Button variant="outline" size="sm" onClick={() => handleSubCreate(cat.id)}>
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        하위 항목 추가
                      </Button>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))
        )}
      </div>

      {/* Category Edit Dialog */}
      <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editCat && categories.find((c) => c.id === editCat.id) ? "대분류 수정" : "대분류 추가"}
            </DialogTitle>
            <DialogDescription>메가메뉴 대분류 카테고리를 설정합니다.</DialogDescription>
          </DialogHeader>
          {editCat && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>카테고리명 *</Label>
                <Input value={editCat.title} onChange={(e) => setEditCat({ ...editCat, title: e.target.value })} placeholder="차량용품" />
              </div>
              <div className="space-y-2">
                <Label>순서</Label>
                <Input type="number" value={editCat.sortOrder} onChange={(e) => setEditCat({ ...editCat, sortOrder: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>발행 상태</Label>
                <Select value={editCat.status} onValueChange={(v) => setEditCat({ ...editCat, status: v as PublishStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">초안</SelectItem>
                    <SelectItem value="published">발행</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCatDialogOpen(false)}>취소</Button>
            <Button onClick={handleCatSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sub-item Edit Dialog */}
      <Dialog open={isSubDialogOpen} onOpenChange={setIsSubDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">하위 항목 편집</DialogTitle>
            <DialogDescription>메가메뉴 하위 링크를 설정합니다.</DialogDescription>
          </DialogHeader>
          {editSubItem && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>라벨 *</Label>
                <Input value={editSubItem.item.label} onChange={(e) => setEditSubItem({ ...editSubItem, item: { ...editSubItem.item, label: e.target.value } })} placeholder="방향제" />
              </div>
              <div className="space-y-2">
                <Label>링크 URL *</Label>
                <Input value={editSubItem.item.href} onChange={(e) => setEditSubItem({ ...editSubItem, item: { ...editSubItem.item, href: e.target.value } })} placeholder="/category/car/air-freshener" />
              </div>
              <div className="space-y-2">
                <Label>순서</Label>
                <Input type="number" value={editSubItem.item.sortOrder} onChange={(e) => setEditSubItem({ ...editSubItem, item: { ...editSubItem.item, sortOrder: Number(e.target.value) } })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubDialogOpen(false)}>취소</Button>
            <Button onClick={handleSubSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
