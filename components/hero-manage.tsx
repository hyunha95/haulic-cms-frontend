"use client"

import { useState } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Calendar,
  Monitor,
  Smartphone,
  X,
  ImageIcon,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
import { mockHeroSlides } from "@/lib/mock-data"
import type { HeroSlide } from "@/lib/types"

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { label: string; className: string }> = {
    published: { label: "발행됨", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    draft: { label: "초안", className: "bg-amber-100 text-amber-700 border-amber-200" },
    scheduled: { label: "예약", className: "bg-blue-100 text-blue-700 border-blue-200" },
  }
  const v = variants[status] || variants.draft
  return <Badge variant="outline" className={v.className}>{v.label}</Badge>
}

export function HeroManage() {
  const [slides, setSlides] = useState<HeroSlide[]>(mockHeroSlides)
  const [editSlide, setEditSlide] = useState<HeroSlide | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop")
  const [showPreview, setShowPreview] = useState(false)

  const handleCreate = () => {
    const newSlide: HeroSlide = {
      id: `hs-${Date.now()}`,
      title: "",
      subtitle: "",
      backgroundImage: "",
      linkUrl: "",
      sortOrder: slides.length + 1,
      isActive: false,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "admin",
      updatedBy: "admin",
    }
    setEditSlide(newSlide)
    setIsDialogOpen(true)
  }

  const handleEdit = (slide: HeroSlide) => {
    setEditSlide({ ...slide })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!editSlide) return
    const exists = slides.find((s) => s.id === editSlide.id)
    if (exists) {
      setSlides(slides.map((s) => (s.id === editSlide.id ? { ...editSlide, updatedAt: new Date().toISOString() } : s)))
    } else {
      setSlides([...slides, editSlide])
    }
    setIsDialogOpen(false)
    setEditSlide(null)
  }

  const handleDelete = (id: string) => {
    setSlides(slides.filter((s) => s.id !== id))
  }

  const handleToggleActive = (id: string) => {
    setSlides(
      slides.map((s) =>
        s.id === id ? { ...s, isActive: !s.isActive, updatedAt: new Date().toISOString() } : s,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">히어로 배너 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {"홈 화면 메인 캐러셀 배너를 관리합니다. 드래그하여 순서를 변경할 수 있습니다."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-4 w-4 mr-1" />
            미리보기
          </Button>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-1" />
            배너 추가
          </Button>
        </div>
      </div>

      {/* Preview */}
      {showPreview && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-foreground">미리보기</CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant={previewMode === "desktop" ? "default" : "ghost"}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setPreviewMode("desktop")}
                >
                  <Monitor className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={previewMode === "mobile" ? "default" : "ghost"}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setPreviewMode("mobile")}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`mx-auto border border-border rounded-lg bg-muted overflow-hidden ${
                previewMode === "mobile" ? "max-w-sm" : "max-w-full"
              }`}
            >
              <div className="aspect-[16/5] relative flex items-center justify-center">
                {slides.filter((s) => s.isActive).length > 0 ? (
                  <div className="w-full h-full bg-gradient-to-r from-primary/20 to-primary/5 flex items-center justify-center p-8">
                    <div className="text-center">
                      <h2 className="text-lg md:text-2xl font-bold text-foreground">
                        {slides.find((s) => s.isActive)?.title || "배너 제목"}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {slides.find((s) => s.isActive)?.subtitle || "배너 부제"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-sm">활성화된 배너가 없습니다</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>제목</TableHead>
                <TableHead className="hidden md:table-cell">링크</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="hidden md:table-cell">스케줄</TableHead>
                <TableHead>활성</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slides.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    {"등록된 배너가 없습니다. '배너 추가' 버튼으로 새 배너를 만들어보세요."}
                  </TableCell>
                </TableRow>
              ) : (
                slides
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((slide) => (
                    <TableRow key={slide.id}>
                      <TableCell>
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground text-sm">{slide.title}</p>
                          <p className="text-xs text-muted-foreground">{slide.subtitle}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-xs text-muted-foreground truncate block max-w-[200px]">
                          {slide.linkUrl}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={slide.status} />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {slide.scheduledStart ? (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(slide.scheduledStart).toLocaleDateString("ko-KR")} ~{" "}
                              {slide.scheduledEnd
                                ? new Date(slide.scheduledEnd).toLocaleDateString("ko-KR")
                                : "무기한"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={slide.isActive}
                          onCheckedChange={() => handleToggleActive(slide.id)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(slide)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(slide.id)}
                          >
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

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editSlide && slides.find((s) => s.id === editSlide.id) ? "배너 수정" : "배너 추가"}
            </DialogTitle>
            <DialogDescription>히어로 캐러셀에 표시될 배너 정보를 입력하세요.</DialogDescription>
          </DialogHeader>
          {editSlide && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  value={editSlide.title}
                  onChange={(e) => setEditSlide({ ...editSlide, title: e.target.value })}
                  placeholder="배너 제목을 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">부제</Label>
                <Input
                  id="subtitle"
                  value={editSlide.subtitle}
                  onChange={(e) => setEditSlide({ ...editSlide, subtitle: e.target.value })}
                  placeholder="배너 부제를 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkUrl">링크 URL</Label>
                <Input
                  id="linkUrl"
                  value={editSlide.linkUrl}
                  onChange={(e) => setEditSlide({ ...editSlide, linkUrl: e.target.value })}
                  placeholder="/exhCtgr/example"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backgroundImage">배경 이미지 URL</Label>
                <Input
                  id="backgroundImage"
                  value={editSlide.backgroundImage}
                  onChange={(e) => setEditSlide({ ...editSlide, backgroundImage: e.target.value })}
                  placeholder="/images/hero-banner.jpg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledStart">시작일</Label>
                  <Input
                    id="scheduledStart"
                    type="date"
                    value={editSlide.scheduledStart?.split("T")[0] || ""}
                    onChange={(e) =>
                      setEditSlide({
                        ...editSlide,
                        scheduledStart: e.target.value ? `${e.target.value}T00:00:00Z` : undefined,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduledEnd">종료일</Label>
                  <Input
                    id="scheduledEnd"
                    type="date"
                    value={editSlide.scheduledEnd?.split("T")[0] || ""}
                    onChange={(e) =>
                      setEditSlide({
                        ...editSlide,
                        scheduledEnd: e.target.value ? `${e.target.value}T23:59:59Z` : undefined,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>발행 상태</Label>
                <Select
                  value={editSlide.status}
                  onValueChange={(val) =>
                    setEditSlide({ ...editSlide, status: val as HeroSlide["status"] })
                  }
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
