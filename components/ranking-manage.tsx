"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Settings2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { mockRankingCategories, mockRankingItems } from "@/lib/mock-data"
import type { RankingCategory, RankingItem, CategoryRankingConfig } from "@/lib/types"

export function RankingManage() {
  const [categories, setCategories] = useState<RankingCategory[]>(mockRankingCategories)
  const [items, setItems] = useState<RankingItem[]>(mockRankingItems)
  const [selectedCat, setSelectedCat] = useState("all")
  const [editItem, setEditItem] = useState<RankingItem | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<CategoryRankingConfig>({
    desktopItemsPerPage: 5, mobileItemsPerPage: 3, maxDisplayCount: 20,
    mobilePeekRatio: 0.15, mobileGap: 12,
  })

  const filteredItems = selectedCat === "all" ? items : items.filter((i) => i.categoryId === selectedCat)

  const handleCreate = () => {
    const newItem: RankingItem = {
      id: `ri-${Date.now()}`, categoryId: categories[0]?.id || "", productName: "", price: 0,
      image: "", rating: 0, reviewCount: 0, badges: [], sortOrder: items.length + 1,
      status: "draft", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">카테고리 랭킹 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {"카테고리별 랭킹 아이템과 캐러셀 설정을 관리합니다."}
          </p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1" />
          랭킹 아이템 추가
        </Button>
      </div>

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">랭킹 아이템</TabsTrigger>
          <TabsTrigger value="config">캐러셀 설정</TabsTrigger>
          <TabsTrigger value="categories">카테고리 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4 mt-4">
          {/* Filter by Category */}
          <div className="flex gap-2 flex-wrap">
            <Button variant={selectedCat === "all" ? "default" : "outline"} size="sm" onClick={() => setSelectedCat("all")}>전체</Button>
            {categories.map((cat) => (
              <Button key={cat.id} variant={selectedCat === cat.id ? "default" : "outline"} size="sm" onClick={() => setSelectedCat(cat.id)}>
                {cat.label}
              </Button>
            ))}
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>상품명</TableHead>
                    <TableHead>카테고리</TableHead>
                    <TableHead>가격</TableHead>
                    <TableHead className="hidden md:table-cell">평점</TableHead>
                    <TableHead className="hidden md:table-cell">리뷰수</TableHead>
                    <TableHead>배지</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        {"등록된 랭킹 아이템이 없습니다."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.sort((a, b) => a.sortOrder - b.sortOrder).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-foreground">{item.productName}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {categories.find((c) => c.id === item.categoryId)?.label || "-"}
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="font-semibold text-foreground">{item.price.toLocaleString()}원</span>
                            {item.originalPrice && (
                              <span className="text-xs text-muted-foreground line-through ml-1">{item.originalPrice.toLocaleString()}원</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{item.rating}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{item.reviewCount}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {item.badges.map((b) => (
                              <Badge key={b} variant="outline" className={b === "HOT" ? "border-red-300 text-red-600 text-[10px]" : "border-blue-300 text-blue-600 text-[10px]"}>
                                {b}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
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
        </TabsContent>

        <TabsContent value="config" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                캐러셀 표시 설정
              </CardTitle>
              <CardDescription>카테고리 랭킹 캐러셀의 페이지당 개수, 최대 노출수, 모바일 설정 등을 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>데스크톱 페이지당 아이템 수</Label>
                  <Input type="number" value={config.desktopItemsPerPage} onChange={(e) => setConfig({ ...config, desktopItemsPerPage: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>모바일 페이지당 아이템 수</Label>
                  <Input type="number" value={config.mobileItemsPerPage} onChange={(e) => setConfig({ ...config, mobileItemsPerPage: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>최대 노출 수</Label>
                  <Input type="number" value={config.maxDisplayCount} onChange={(e) => setConfig({ ...config, maxDisplayCount: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>모바일 Peek 비율 (0~1)</Label>
                  <Input type="number" step="0.05" value={config.mobilePeekRatio} onChange={(e) => setConfig({ ...config, mobilePeekRatio: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>모바일 간격 (px)</Label>
                  <Input type="number" value={config.mobileGap} onChange={(e) => setConfig({ ...config, mobileGap: Number(e.target.value) })} />
                </div>
              </div>
              <div className="mt-6">
                <Button>설정 저장</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">카테고리 목록</CardTitle>
              <CardDescription>랭킹에 사용할 카테고리를 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-foreground">{cat.label}</span>
                      <Badge variant="outline" className="text-[10px]">순서: {cat.sortOrder}</Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editItem && items.find((i) => i.id === editItem.id) ? "랭킹 아이템 수정" : "랭킹 아이템 추가"}</DialogTitle>
            <DialogDescription>랭킹에 표시할 상품 정보를 입력하세요.</DialogDescription>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>상품명 *</Label>
                <Input value={editItem.productName} onChange={(e) => setEditItem({ ...editItem, productName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>카테고리</Label>
                <Select value={editItem.categoryId} onValueChange={(val) => setEditItem({ ...editItem, categoryId: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>판매가 (원)</Label>
                  <Input type="number" value={editItem.price} onChange={(e) => setEditItem({ ...editItem, price: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>원가 (원)</Label>
                  <Input type="number" value={editItem.originalPrice || ""} onChange={(e) => setEditItem({ ...editItem, originalPrice: Number(e.target.value) || undefined })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>평점 (1~5)</Label>
                  <Input type="number" step="0.1" min="1" max="5" value={editItem.rating} onChange={(e) => setEditItem({ ...editItem, rating: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>리뷰 수</Label>
                  <Input type="number" value={editItem.reviewCount} onChange={(e) => setEditItem({ ...editItem, reviewCount: Number(e.target.value) })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>이미지 URL</Label>
                <Input value={editItem.image} onChange={(e) => setEditItem({ ...editItem, image: e.target.value })} />
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
