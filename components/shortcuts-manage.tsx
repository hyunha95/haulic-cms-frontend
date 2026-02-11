"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { mockQuickShortcuts } from "@/lib/mock-data"
import type { QuickShortcut } from "@/lib/types"

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { label: string; className: string }> = {
    published: { label: "발행됨", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    draft: { label: "초안", className: "bg-amber-100 text-amber-700 border-amber-200" },
  }
  const v = variants[status] || variants.draft
  return <Badge variant="outline" className={v.className}>{v.label}</Badge>
}

export function ShortcutsManage() {
  const [items, setItems] = useState<QuickShortcut[]>(mockQuickShortcuts)
  const [editItem, setEditItem] = useState<QuickShortcut | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleCreate = () => {
    const newItem: QuickShortcut = {
      id: `qs-${Date.now()}`, name: "", iconName: "Star", linkUrl: "", sortOrder: items.length + 1,
      isActive: false, status: "draft", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      createdBy: "admin", updatedBy: "admin",
    }
    setEditItem(newItem)
    setIsOpen(true)
  }

  const handleSave = () => {
    if (!editItem) return
    const exists = items.find((i) => i.id === editItem.id)
    if (exists) {
      setItems(items.map((i) => (i.id === editItem.id ? { ...editItem, updatedAt: new Date().toISOString() } : i)))
    } else {
      setItems([...items, editItem])
    }
    setIsOpen(false)
    setEditItem(null)
  }

  const handleDelete = (id: string) => setItems(items.filter((i) => i.id !== id))
  const handleToggle = (id: string) => setItems(items.map((i) => i.id === id ? { ...i, isActive: !i.isActive } : i))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">퀵 바로가기 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {"홈 화면 상단 퀵 바로가기 아이콘을 관리합니다."}
          </p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1" />
          바로가기 추가
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>이름</TableHead>
                <TableHead>아이콘</TableHead>
                <TableHead className="hidden md:table-cell">링크</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>활성</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    {"등록된 바로가기가 없습니다."}
                  </TableCell>
                </TableRow>
              ) : (
                items.sort((a, b) => a.sortOrder - b.sortOrder).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell><GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" /></TableCell>
                    <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{item.iconName}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{item.linkUrl}</TableCell>
                    <TableCell><StatusBadge status={item.status} /></TableCell>
                    <TableCell><Switch checked={item.isActive} onCheckedChange={() => handleToggle(item.id)} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditItem({ ...item }); setIsOpen(true) }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editItem && items.find((i) => i.id === editItem.id) ? "바로가기 수정" : "바로가기 추가"}</DialogTitle>
            <DialogDescription>퀵 바로가기 정보를 입력하세요.</DialogDescription>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>이름 *</Label>
                <Input value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} placeholder="바로가기 이름" />
              </div>
              <div className="space-y-2">
                <Label>아이콘 이름</Label>
                <Input value={editItem.iconName} onChange={(e) => setEditItem({ ...editItem, iconName: e.target.value })} placeholder="Lucide 아이콘 이름 (예: Clock, Ticket)" />
              </div>
              <div className="space-y-2">
                <Label>링크 URL</Label>
                <Input value={editItem.linkUrl} onChange={(e) => setEditItem({ ...editItem, linkUrl: e.target.value })} placeholder="/timesale" />
              </div>
              <div className="space-y-2">
                <Label>발행 상태</Label>
                <Select value={editItem.status} onValueChange={(val) => setEditItem({ ...editItem, status: val as QuickShortcut["status"] })}>
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
            <Button variant="outline" onClick={() => setIsOpen(false)}>취소</Button>
            <Button onClick={handleSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
