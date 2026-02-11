"use client"

import { useState, useMemo } from "react"
import {
  Upload,
  Search,
  Trash2,
  ImageIcon,
  Grid3X3,
  List,
  Filter,
  Copy,
  Download,
  X,
  Eye,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { mockMedia } from "@/lib/mock-data"
import type { MediaItem } from "@/lib/types"

function formatFileSize(bytes: number) {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${bytes} B`
}

export function MediaManage() {
  const [items, setItems] = useState<MediaItem[]>(mockMedia)
  const [search, setSearch] = useState("")
  const [sectionFilter, setSectionFilter] = useState("전체")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  const sections = useMemo(() => {
    const set = new Set(items.map((i) => i.section).filter(Boolean))
    return Array.from(set) as string[]
  }, [items])

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const matchSearch = i.fileName.includes(search) || i.tags.some((t) => t.includes(search))
      const matchSection = sectionFilter === "전체" || i.section === sectionFilter
      return matchSearch && matchSection
    })
  }, [items, search, sectionFilter])

  const stats = {
    total: items.length,
    totalSize: items.reduce((a, i) => a + i.fileSize, 0),
  }

  const handleDelete = (id: string) => {
    setItems(items.filter((i) => i.id !== id))
    if (selectedItem?.id === id) {
      setIsDetailOpen(false)
      setSelectedItem(null)
    }
  }

  const handleUploadSim = () => {
    const now = new Date().toISOString()
    const newItem: MediaItem = {
      id: `m-${Date.now()}`, fileName: `uploaded-image-${Date.now()}.jpg`, url: `/images/uploaded-${Date.now()}.jpg`,
      fileSize: Math.floor(Math.random() * 300000) + 50000, mimeType: "image/jpeg",
      width: 1200, height: 800, tags: ["업로드"], section: "product",
      status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin",
    }
    setItems([newItem, ...items])
    setIsUploadOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">미디어 라이브러리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {"이미지, 배너, 상품 이미지 등을 관리합니다."}
          </p>
        </div>
        <Button size="sm" onClick={() => setIsUploadOpen(true)}>
          <Upload className="h-4 w-4 mr-1" />
          이미지 업로드
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">전체 미디어</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-foreground">{formatFileSize(stats.totalSize)}</p>
            <p className="text-xs text-muted-foreground">총 용량</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-foreground">{sections.length}</p>
            <p className="text-xs text-muted-foreground">섹션 수</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1.5 block">검색</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="파일명 또는 태그로 검색..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="w-full md:w-40">
              <Label className="text-xs text-muted-foreground mb-1.5 block">섹션</Label>
              <Select value={sectionFilter} onValueChange={setSectionFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체</SelectItem>
                  {sections.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-1">
              <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" className="h-9 w-9" onClick={() => setViewMode("grid")}>
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" className="h-9 w-9" onClick={() => setViewMode("list")}>
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageIcon className="h-12 w-12" />
              <p>{"검색 결과가 없습니다."}</p>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
              onClick={() => { setSelectedItem(item); setIsDetailOpen(true) }}
            >
              <CardContent className="p-3">
                <div className="aspect-square bg-muted rounded-md border border-border flex items-center justify-center mb-2">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-xs font-medium text-foreground truncate">{item.fileName}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground">{formatFileSize(item.fileSize)}</span>
                  {item.section && (
                    <Badge variant="secondary" className="text-[10px]">{item.section}</Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {item.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>파일명</TableHead>
                  <TableHead>크기</TableHead>
                  <TableHead className="hidden md:table-cell">해상도</TableHead>
                  <TableHead className="hidden md:table-cell">섹션</TableHead>
                  <TableHead>태그</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id} className="cursor-pointer" onClick={() => { setSelectedItem(item); setIsDetailOpen(true) }}>
                    <TableCell>
                      <div className="h-8 w-8 rounded bg-muted border border-border flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-foreground text-sm">{item.fileName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatFileSize(item.fileSize)}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {item.width && item.height ? `${item.width}×${item.height}` : "-"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {item.section && <Badge variant="secondary" className="text-[10px]">{item.section}</Badge>}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {item.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">미디어 상세</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg border border-border flex items-center justify-center">
                <ImageIcon className="h-16 w-16 text-muted-foreground" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">파일명</p>
                  <p className="font-medium text-foreground">{selectedItem.fileName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">파일 크기</p>
                  <p className="font-medium text-foreground">{formatFileSize(selectedItem.fileSize)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">MIME 타입</p>
                  <p className="font-medium text-foreground">{selectedItem.mimeType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">해상도</p>
                  <p className="font-medium text-foreground">
                    {selectedItem.width && selectedItem.height ? `${selectedItem.width}×${selectedItem.height}` : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">섹션</p>
                  <p className="font-medium text-foreground">{selectedItem.section || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">업로드일</p>
                  <p className="font-medium text-foreground">{new Date(selectedItem.createdAt).toLocaleDateString("ko-KR")}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1.5">태그</p>
                <div className="flex flex-wrap gap-1">
                  {selectedItem.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1.5">URL</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded flex-1 text-foreground">{selectedItem.url}</code>
                  <Button variant="outline" size="icon" className="h-7 w-7 shrink-0">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="destructive" size="sm" onClick={() => selectedItem && handleDelete(selectedItem.id)}>
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">이미지 업로드</DialogTitle>
            <DialogDescription>이미지를 드래그하거나 클릭하여 업로드합니다.</DialogDescription>
          </DialogHeader>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">{"클릭하여 파일 선택"}</p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF (최대 10MB)</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>취소</Button>
            <Button onClick={handleUploadSim}>
              <Upload className="h-4 w-4 mr-1" />
              업로드 (시뮬레이션)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
