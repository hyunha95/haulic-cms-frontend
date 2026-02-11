"use client"

import { useState, useMemo } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  MapPin,
  Phone,
  Clock,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockStores, mockPickupRegions } from "@/lib/mock-data"
import type { PickupStore, PickupRegion, PublishStatus } from "@/lib/types"

function OperatingStatusBadge({ status }: { status: string }) {
  const variants: Record<string, { label: string; className: string }> = {
    open: { label: "운영중", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    closed: { label: "폐점", className: "bg-muted text-muted-foreground border-border" },
    temporary_closed: { label: "임시휴업", className: "bg-amber-100 text-amber-700 border-amber-200" },
  }
  const v = variants[status] || variants.closed
  return <Badge variant="outline" className={v.className}>{v.label}</Badge>
}

export function StoresManage() {
  const [stores, setStores] = useState<PickupStore[]>(mockStores)
  const [regions, setRegions] = useState<PickupRegion[]>(mockPickupRegions)
  const [editStore, setEditStore] = useState<PickupStore | null>(null)
  const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false)
  const [editRegion, setEditRegion] = useState<PickupRegion | null>(null)
  const [isRegionDialogOpen, setIsRegionDialogOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [regionFilter, setRegionFilter] = useState("전체")

  const filteredStores = useMemo(() => {
    return stores.filter((s) => {
      const matchSearch = s.name.includes(search) || s.address.includes(search) || s.searchKeywords.some((k) => k.includes(search))
      const matchRegion = regionFilter === "전체" || s.regionId === regionFilter
      return matchSearch && matchRegion
    })
  }, [stores, search, regionFilter])

  const stats = {
    total: stores.length,
    open: stores.filter((s) => s.operatingStatus === "open").length,
    closed: stores.filter((s) => s.operatingStatus === "closed").length,
    tempClosed: stores.filter((s) => s.operatingStatus === "temporary_closed").length,
  }

  // Store handlers
  const handleStoreCreate = () => {
    const now = new Date().toISOString()
    const newStore: PickupStore = {
      id: `st-${Date.now()}`, regionId: regions[0]?.id || "", name: "", address: "",
      operatingStatus: "open", searchKeywords: [], phone: "", operatingHours: "",
      status: "draft", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin",
    }
    setEditStore(newStore)
    setIsStoreDialogOpen(true)
  }

  const handleStoreSave = () => {
    if (!editStore) return
    const exists = stores.find((s) => s.id === editStore.id)
    if (exists) {
      setStores(stores.map((s) => (s.id === editStore.id ? { ...editStore, updatedAt: new Date().toISOString() } : s)))
    } else {
      setStores([...stores, editStore])
    }
    setIsStoreDialogOpen(false)
    setEditStore(null)
  }

  const handleStoreDelete = (id: string) => setStores(stores.filter((s) => s.id !== id))

  // Region handlers
  const handleRegionCreate = () => {
    const newRegion: PickupRegion = { id: `r-${Date.now()}`, name: "", sortOrder: regions.length + 1 }
    setEditRegion(newRegion)
    setIsRegionDialogOpen(true)
  }

  const handleRegionSave = () => {
    if (!editRegion) return
    const exists = regions.find((r) => r.id === editRegion.id)
    if (exists) {
      setRegions(regions.map((r) => (r.id === editRegion.id ? editRegion : r)))
    } else {
      setRegions([...regions, editRegion])
    }
    setIsRegionDialogOpen(false)
    setEditRegion(null)
  }

  const handleRegionDelete = (id: string) => setRegions(regions.filter((r) => r.id !== id))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">매장/배송 설정</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {"픽업 매장 정보와 배송 지역을 관리합니다."}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">전체 매장</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-emerald-600">{stats.open}</p>
            <p className="text-xs text-muted-foreground">운영중</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-amber-600">{stats.tempClosed}</p>
            <p className="text-xs text-muted-foreground">임시휴업</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-muted-foreground">{stats.closed}</p>
            <p className="text-xs text-muted-foreground">폐점</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stores">
        <TabsList>
          <TabsTrigger value="stores">매장 목록</TabsTrigger>
          <TabsTrigger value="regions">지역 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="stores" className="space-y-4 mt-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground mb-1.5 block">검색</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="매장명, 주소, 키워드로 검색..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                </div>
                <div className="w-full md:w-40">
                  <Label className="text-xs text-muted-foreground mb-1.5 block">지역</Label>
                  <Select value={regionFilter} onValueChange={setRegionFilter}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="전체">전체 지역</SelectItem>
                      {regions.sort((a, b) => a.sortOrder - b.sortOrder).map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button size="sm" onClick={handleStoreCreate}>
                  <Plus className="h-4 w-4 mr-1" />
                  매장 추가
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stores Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>매장명</TableHead>
                    <TableHead className="hidden md:table-cell">지역</TableHead>
                    <TableHead className="hidden lg:table-cell">주소</TableHead>
                    <TableHead>운영상태</TableHead>
                    <TableHead className="hidden md:table-cell">연락처</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStores.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <MapPin className="h-8 w-8" />
                          <span>{"검색 결과가 없습니다."}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStores.map((store) => (
                      <TableRow key={store.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground text-sm">{store.name}</p>
                            <div className="flex gap-1 mt-1 md:hidden">
                              {store.searchKeywords.slice(0, 2).map((k) => (
                                <Badge key={k} variant="secondary" className="text-[10px]">{k}</Badge>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {regions.find((r) => r.id === store.regionId)?.name || "-"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{store.address}</TableCell>
                        <TableCell><OperatingStatusBadge status={store.operatingStatus} /></TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {store.phone}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditStore({ ...store }); setIsStoreDialogOpen(true) }}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleStoreDelete(store.id)}>
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

        <TabsContent value="regions" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{"매장 분류에 사용되는 지역을 관리합니다."}</p>
            <Button size="sm" onClick={handleRegionCreate}>
              <Plus className="h-4 w-4 mr-1" />
              지역 추가
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>지역명</TableHead>
                    <TableHead>매장 수</TableHead>
                    <TableHead>순서</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regions.sort((a, b) => a.sortOrder - b.sortOrder).map((region) => (
                    <TableRow key={region.id}>
                      <TableCell className="font-medium text-foreground">{region.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {stores.filter((s) => s.regionId === region.id).length}개
                        </Badge>
                      </TableCell>
                      <TableCell><Badge variant="secondary" className="text-[10px] tabular-nums">{region.sortOrder}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditRegion({ ...region }); setIsRegionDialogOpen(true) }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRegionDelete(region.id)}>
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
        </TabsContent>
      </Tabs>

      {/* Store Edit Dialog */}
      <Dialog open={isStoreDialogOpen} onOpenChange={setIsStoreDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editStore && stores.find((s) => s.id === editStore.id) ? "매장 수정" : "매장 추가"}
            </DialogTitle>
            <DialogDescription>픽업 매장 정보를 입력하세요.</DialogDescription>
          </DialogHeader>
          {editStore && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>매장명 *</Label>
                  <Input value={editStore.name} onChange={(e) => setEditStore({ ...editStore, name: e.target.value })} placeholder="강남점" />
                </div>
                <div className="space-y-2">
                  <Label>지역</Label>
                  <Select value={editStore.regionId} onValueChange={(v) => setEditStore({ ...editStore, regionId: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {regions.map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>주소 *</Label>
                <Input value={editStore.address} onChange={(e) => setEditStore({ ...editStore, address: e.target.value })} placeholder="서울특별시 강남구 테헤란로 123" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>전화번호</Label>
                  <Input value={editStore.phone} onChange={(e) => setEditStore({ ...editStore, phone: e.target.value })} placeholder="02-1234-5678" />
                </div>
                <div className="space-y-2">
                  <Label>운영시간</Label>
                  <Input value={editStore.operatingHours} onChange={(e) => setEditStore({ ...editStore, operatingHours: e.target.value })} placeholder="09:00 - 22:00" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>운영상태</Label>
                <Select value={editStore.operatingStatus} onValueChange={(v) => setEditStore({ ...editStore, operatingStatus: v as PickupStore["operatingStatus"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">운영중</SelectItem>
                    <SelectItem value="temporary_closed">임시휴업</SelectItem>
                    <SelectItem value="closed">폐점</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>검색 키워드 (쉼표 구분)</Label>
                <Input
                  value={editStore.searchKeywords.join(", ")}
                  onChange={(e) => setEditStore({ ...editStore, searchKeywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean) })}
                  placeholder="강남, 테헤란로, 역삼"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStoreDialogOpen(false)}>취소</Button>
            <Button onClick={handleStoreSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Region Edit Dialog */}
      <Dialog open={isRegionDialogOpen} onOpenChange={setIsRegionDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editRegion && regions.find((r) => r.id === editRegion.id) ? "지역 수정" : "지역 추가"}
            </DialogTitle>
            <DialogDescription>배송/픽업 지역 정보를 설정합니다.</DialogDescription>
          </DialogHeader>
          {editRegion && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>지역명 *</Label>
                <Input value={editRegion.name} onChange={(e) => setEditRegion({ ...editRegion, name: e.target.value })} placeholder="서울" />
              </div>
              <div className="space-y-2">
                <Label>순서</Label>
                <Input type="number" value={editRegion.sortOrder} onChange={(e) => setEditRegion({ ...editRegion, sortOrder: Number(e.target.value) })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRegionDialogOpen(false)}>취소</Button>
            <Button onClick={handleRegionSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
