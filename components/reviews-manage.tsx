"use client"

import React from "react"

import { useState, useMemo } from "react"
import {
  Search,
  Eye,
  EyeOff,
  AlertTriangle,
  Star,
  ImageIcon,
  Filter,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  ThumbsUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockReviews, mockProducts } from "@/lib/mock-data"
import type { Review, ReviewModerationStatus } from "@/lib/types"

function ModerationBadge({ status }: { status: ReviewModerationStatus }) {
  const variants: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    visible: { label: "노출", className: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <Eye className="h-3 w-3" /> },
    hidden: { label: "숨김", className: "bg-muted text-muted-foreground border-border", icon: <EyeOff className="h-3 w-3" /> },
    reported: { label: "신고", className: "bg-red-100 text-red-700 border-red-200", icon: <AlertTriangle className="h-3 w-3" /> },
  }
  const v = variants[status]
  return (
    <Badge variant="outline" className={`${v.className} flex items-center gap-1`}>
      {v.icon}
      {v.label}
    </Badge>
  )
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
        />
      ))}
    </div>
  )
}

// Star distribution data
const starDistribution = [
  { stars: 5, count: 145, percentage: 58 },
  { stars: 4, count: 62, percentage: 25 },
  { stars: 3, count: 23, percentage: 9 },
  { stars: 2, count: 12, percentage: 5 },
  { stars: 1, count: 8, percentage: 3 },
]

export function ReviewsManage() {
  const [reviews, setReviews] = useState<Review[]>(mockReviews)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("전체")
  const [ratingFilter, setRatingFilter] = useState("전체")
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      const matchSearch =
        r.authorName.includes(search) || r.content.includes(search)
      const matchStatus =
        statusFilter === "전체" || r.moderationStatus === statusFilter
      const matchRating =
        ratingFilter === "전체" || r.rating === Number(ratingFilter)
      return matchSearch && matchStatus && matchRating
    })
  }, [reviews, search, statusFilter, ratingFilter])

  const handleModeration = (id: string, newStatus: ReviewModerationStatus) => {
    setReviews(
      reviews.map((r) =>
        r.id === id ? { ...r, moderationStatus: newStatus, updatedAt: new Date().toISOString() } : r,
      ),
    )
    if (selectedReview?.id === id) {
      setSelectedReview({ ...selectedReview, moderationStatus: newStatus })
    }
  }

  const getProductName = (productId: string) => {
    return mockProducts.find((p) => p.id === productId)?.name || "알 수 없는 상품"
  }

  const reviewStats = {
    total: reviews.length,
    visible: reviews.filter((r) => r.moderationStatus === "visible").length,
    hidden: reviews.filter((r) => r.moderationStatus === "hidden").length,
    reported: reviews.filter((r) => r.moderationStatus === "reported").length,
    avgRating: (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">리뷰 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {"고객 리뷰를 조회하고 모더레이션할 수 있습니다."}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-foreground">{reviewStats.total}</p>
            <p className="text-xs text-muted-foreground">전체 리뷰</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <p className="text-2xl font-bold text-foreground">{reviewStats.avgRating}</p>
            </div>
            <p className="text-xs text-muted-foreground">평균 평점</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-emerald-600">{reviewStats.visible}</p>
            <p className="text-xs text-muted-foreground">노출 중</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-muted-foreground">{reviewStats.hidden}</p>
            <p className="text-xs text-muted-foreground">숨김</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-red-600">{reviewStats.reported}</p>
            <p className="text-xs text-muted-foreground">신고 대기</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">리뷰 목록</TabsTrigger>
          <TabsTrigger value="stats">평점 분포</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 mt-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground mb-1.5 block">검색</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="작성자 또는 내용으로 검색..."
                      className="pl-8"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-full md:w-32">
                  <Label className="text-xs text-muted-foreground mb-1.5 block">상태</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="전체">전체</SelectItem>
                      <SelectItem value="visible">노출</SelectItem>
                      <SelectItem value="hidden">숨김</SelectItem>
                      <SelectItem value="reported">신고</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-32">
                  <Label className="text-xs text-muted-foreground mb-1.5 block">평점</Label>
                  <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="전체">전체</SelectItem>
                      <SelectItem value="5">5점</SelectItem>
                      <SelectItem value="4">4점</SelectItem>
                      <SelectItem value="3">3점</SelectItem>
                      <SelectItem value="2">2점</SelectItem>
                      <SelectItem value="1">1점</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>작성자</TableHead>
                    <TableHead>상품</TableHead>
                    <TableHead>평점</TableHead>
                    <TableHead className="hidden md:table-cell">내용</TableHead>
                    <TableHead className="hidden lg:table-cell">작성일</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <MessageSquare className="h-8 w-8" />
                          <span>{"검색 결과가 없습니다."}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((review) => (
                      <TableRow key={review.id} className="cursor-pointer" onClick={() => { setSelectedReview(review); setIsDetailOpen(true) }}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
                              {review.authorName[0]}
                            </div>
                            <span className="text-sm font-medium text-foreground">{review.authorName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground truncate block max-w-[150px]">
                            {getProductName(review.productId)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <RatingStars rating={review.rating} />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {review.content}
                            </p>
                            {review.hasPhoto && (
                              <Badge variant="secondary" className="text-[10px] shrink-0">
                                <ImageIcon className="h-2.5 w-2.5 mr-0.5" />
                                포토
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <ModerationBadge status={review.moderationStatus} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            {review.moderationStatus !== "visible" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                title="노출"
                                onClick={() => handleModeration(review.id, "visible")}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {review.moderationStatus !== "hidden" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                title="숨김"
                                onClick={() => handleModeration(review.id, "hidden")}
                              >
                                <EyeOff className="h-3.5 w-3.5" />
                              </Button>
                            )}
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

        <TabsContent value="stats" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">별점 분포</CardTitle>
              <CardDescription>전체 리뷰의 평점 분포를 확인합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {starDistribution.map((item) => (
                  <div key={item.stars} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground w-10">{item.stars}점</span>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-16 text-right">
                      {item.count}건 ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">리뷰 상세</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground">
                    {selectedReview.authorName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{selectedReview.authorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(selectedReview.createdAt).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <ModerationBadge status={selectedReview.moderationStatus} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <RatingStars rating={selectedReview.rating} />
                  <span className="text-sm text-foreground font-medium">{selectedReview.rating}.0</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  상품: {getProductName(selectedReview.productId)}
                </p>
                {selectedReview.purchaseOption && (
                  <p className="text-sm text-muted-foreground">
                    구매 옵션: {selectedReview.purchaseOption}
                  </p>
                )}
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-foreground leading-relaxed">{selectedReview.content}</p>
              </div>

              {selectedReview.hasPhoto && (
                <div className="flex gap-2">
                  {(selectedReview.photoUrls || []).map((url, i) => (
                    <div
                      key={i}
                      className="h-20 w-20 rounded-md bg-muted border border-border flex items-center justify-center"
                    >
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ThumbsUp className="h-4 w-4" />
                <span>도움이 됨: {selectedReview.helpfulCount}명</span>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedReview && handleModeration(selectedReview.id, "visible")}
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              노출
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedReview && handleModeration(selectedReview.id, "hidden")}
            >
              <EyeOff className="h-3.5 w-3.5 mr-1" />
              숨김
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => selectedReview && handleModeration(selectedReview.id, "reported")}
            >
              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              신고 처리
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
