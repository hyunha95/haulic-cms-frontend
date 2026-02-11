"use client"

import { useState } from "react"
import { Save, Monitor, Smartphone, Download, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { mockAppDownloadCTA } from "@/lib/mock-data"
import type { AppDownloadCTA, PublishStatus } from "@/lib/types"

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { label: string; className: string }> = {
    published: { label: "발행됨", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    draft: { label: "초안", className: "bg-amber-100 text-amber-700 border-amber-200" },
  }
  const v = variants[status] || variants.draft
  return <Badge variant="outline" className={v.className}>{v.label}</Badge>
}

export function AppCtaManage() {
  const [data, setData] = useState<AppDownloadCTA>(mockAppDownloadCTA)
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop")
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setData({ ...data, updatedAt: new Date().toISOString() })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">앱 다운로드 CTA 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {"홈 화면 하단의 앱 다운로드 유도 섹션을 관리합니다."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={data.status} />
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            {saved ? "저장됨!" : "저장"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">기본 정보</CardTitle>
              <CardDescription>앱 다운로드 유도 섹션의 텍스트를 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>제목 *</Label>
                <Input
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                  placeholder="천원마켓 앱 다운로드"
                />
              </div>
              <div className="space-y-2">
                <Label>설명</Label>
                <Textarea
                  value={data.description}
                  onChange={(e) => setData({ ...data, description: e.target.value })}
                  placeholder="앱에서만 받을 수 있는 특별 혜택!"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>발행 상태</Label>
                <Select value={data.status} onValueChange={(v) => setData({ ...data, status: v as PublishStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">초안</SelectItem>
                    <SelectItem value="published">발행</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">스토어 링크</CardTitle>
              <CardDescription>iOS/Android 앱 스토어 버튼 설정입니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 p-4 border border-border rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Badge variant="outline">iOS</Badge>
                  App Store
                </div>
                <div className="space-y-2">
                  <Label>버튼 라벨</Label>
                  <Input
                    value={data.iosLabel}
                    onChange={(e) => setData({ ...data, iosLabel: e.target.value })}
                    placeholder="App Store"
                  />
                </div>
                <div className="space-y-2">
                  <Label>스토어 URL</Label>
                  <Input
                    value={data.iosUrl}
                    onChange={(e) => setData({ ...data, iosUrl: e.target.value })}
                    placeholder="https://apps.apple.com/..."
                  />
                </div>
              </div>

              <div className="space-y-4 p-4 border border-border rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Badge variant="outline">Android</Badge>
                  Google Play
                </div>
                <div className="space-y-2">
                  <Label>버튼 라벨</Label>
                  <Input
                    value={data.androidLabel}
                    onChange={(e) => setData({ ...data, androidLabel: e.target.value })}
                    placeholder="Google Play"
                  />
                </div>
                <div className="space-y-2">
                  <Label>스토어 URL</Label>
                  <Input
                    value={data.androidUrl}
                    onChange={(e) => setData({ ...data, androidUrl: e.target.value })}
                    placeholder="https://play.google.com/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-foreground">미리보기</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant={previewMode === "desktop" ? "default" : "outline"}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPreviewMode("desktop")}
                  >
                    <Monitor className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant={previewMode === "mobile" ? "default" : "outline"}
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
              <div className={`border border-border rounded-lg overflow-hidden bg-gradient-to-r from-primary/5 to-primary/10 ${
                previewMode === "mobile" ? "max-w-sm mx-auto" : ""
              }`}>
                <div className={`p-6 ${previewMode === "mobile" ? "p-4 text-center" : "flex items-center justify-between"}`}>
                  <div className={previewMode === "mobile" ? "mb-4" : ""}>
                    <div className="flex items-center gap-2 mb-2">
                      <Download className="h-5 w-5 text-primary" />
                      <h3 className="font-bold text-foreground">{data.title || "제목 없음"}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{data.description || "설명 없음"}</p>
                  </div>
                  <div className={`flex gap-2 ${previewMode === "mobile" ? "justify-center" : "shrink-0"}`}>
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <ExternalLink className="h-3 w-3" />
                      {data.iosLabel || "App Store"}
                    </Button>
                    <Button size="sm" className="gap-1.5">
                      <ExternalLink className="h-3 w-3" />
                      {data.androidLabel || "Google Play"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">수정 이력</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>최종 수정: {new Date(data.updatedAt).toLocaleString("ko-KR")}</p>
                <p>수정자: {data.updatedBy}</p>
                <p>생성일: {new Date(data.createdAt).toLocaleString("ko-KR")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
