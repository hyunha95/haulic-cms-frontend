"use client"

import { useState } from "react"
import {
  Save,
  Globe,
  Building2,
  Bell,
  Search,
  Palette,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { mockTopBarConfig, mockSearchConfig } from "@/lib/mock-data"
import type { TopBarConfig, SearchConfig, PublishStatus } from "@/lib/types"

export function SettingsManage() {
  // Site meta
  const [siteMeta, setSiteMeta] = useState({
    title: "천원마켓",
    description: "가성비 최고 생활용품 쇼핑몰",
    themeColor: "#FF6B35",
  })

  // Brand info
  const [brandInfo, setBrandInfo] = useState({
    logoText: "천원마켓",
    csPhoneNumber: "1588-1000",
    companyName: "(주)천원마켓",
    ceoName: "홍길동",
    businessNumber: "123-45-67890",
    address: "서울특별시 강남구 테헤란로 123, 15층",
  })

  // Top bar config
  const [topBar, setTopBar] = useState<TopBarConfig>(mockTopBarConfig)

  // Search config
  const [searchConfig, setSearchConfig] = useState<SearchConfig>(mockSearchConfig)

  const [saved, setSaved] = useState<string | null>(null)

  const handleSave = (section: string) => {
    setSaved(section)
    setTimeout(() => setSaved(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">시스템 설정</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {"사이트 전체에 적용되는 기본 설정을 관리합니다."}
        </p>
      </div>

      <Tabs defaultValue="site">
        <TabsList className="flex-wrap">
          <TabsTrigger value="site" className="gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            사이트 메타
          </TabsTrigger>
          <TabsTrigger value="brand" className="gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            브랜드 정보
          </TabsTrigger>
          <TabsTrigger value="topbar" className="gap-1.5">
            <Bell className="h-3.5 w-3.5" />
            상단 TopBar
          </TabsTrigger>
          <TabsTrigger value="search" className="gap-1.5">
            <Search className="h-3.5 w-3.5" />
            검색 설정
          </TabsTrigger>
        </TabsList>

        {/* Site Meta */}
        <TabsContent value="site" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Globe className="h-4 w-4" />
                사이트 메타 정보
              </CardTitle>
              <CardDescription>HTML head에 반영되는 사이트 기본 정보입니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>사이트 제목 *</Label>
                <Input
                  value={siteMeta.title}
                  onChange={(e) => setSiteMeta({ ...siteMeta, title: e.target.value })}
                  placeholder="천원마켓"
                />
                <p className="text-xs text-muted-foreground">{"브라우저 탭에 표시되는 사이트 제목입니다."}</p>
              </div>
              <div className="space-y-2">
                <Label>사이트 설명</Label>
                <Textarea
                  value={siteMeta.description}
                  onChange={(e) => setSiteMeta({ ...siteMeta, description: e.target.value })}
                  placeholder="사이트 설명"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">{"검색엔진 결과에 표시되는 meta description입니다."}</p>
              </div>
              <div className="space-y-2">
                <Label>테마 컬러</Label>
                <div className="flex items-center gap-3">
                  <Input
                    value={siteMeta.themeColor}
                    onChange={(e) => setSiteMeta({ ...siteMeta, themeColor: e.target.value })}
                    placeholder="#FF6B35"
                    className="flex-1"
                  />
                  <div
                    className="h-9 w-9 rounded-md border border-border shrink-0"
                    style={{ backgroundColor: siteMeta.themeColor }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{"모바일 브라우저 상단바 색상(meta theme-color)입니다."}</p>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave("site")}>
                  <Save className="h-4 w-4 mr-1" />
                  {saved === "site" ? "저장됨!" : "저장"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* SEO Preview */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">검색 결과 미리보기</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-border rounded-lg p-4 bg-card max-w-lg">
                <p className="text-blue-600 text-lg hover:underline cursor-pointer">{siteMeta.title || "사이트 제목"}</p>
                <p className="text-xs text-emerald-700 mt-0.5">{"https://www.1000market.co.kr"}</p>
                <p className="text-sm text-muted-foreground mt-1">{siteMeta.description || "사이트 설명이 여기에 표시됩니다."}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Brand Info */}
        <TabsContent value="brand" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                브랜드 기본 정보
              </CardTitle>
              <CardDescription>헤더 로고, 푸터, 고객센터 등에 사용되는 브랜드 정보입니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>로고 텍스트 *</Label>
                  <Input
                    value={brandInfo.logoText}
                    onChange={(e) => setBrandInfo({ ...brandInfo, logoText: e.target.value })}
                    placeholder="천원마켓"
                  />
                  <p className="text-xs text-muted-foreground">{"헤더에 표시되는 로고 텍스트입니다."}</p>
                </div>
                <div className="space-y-2">
                  <Label>고객센터 전화번호</Label>
                  <Input
                    value={brandInfo.csPhoneNumber}
                    onChange={(e) => setBrandInfo({ ...brandInfo, csPhoneNumber: e.target.value })}
                    placeholder="1588-1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>회사명</Label>
                  <Input
                    value={brandInfo.companyName}
                    onChange={(e) => setBrandInfo({ ...brandInfo, companyName: e.target.value })}
                    placeholder="(주)천원마켓"
                  />
                </div>
                <div className="space-y-2">
                  <Label>대표자명</Label>
                  <Input
                    value={brandInfo.ceoName}
                    onChange={(e) => setBrandInfo({ ...brandInfo, ceoName: e.target.value })}
                    placeholder="홍길동"
                  />
                </div>
                <div className="space-y-2">
                  <Label>사업자등록번호</Label>
                  <Input
                    value={brandInfo.businessNumber}
                    onChange={(e) => setBrandInfo({ ...brandInfo, businessNumber: e.target.value })}
                    placeholder="123-45-67890"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>주소</Label>
                  <Input
                    value={brandInfo.address}
                    onChange={(e) => setBrandInfo({ ...brandInfo, address: e.target.value })}
                    placeholder="서울특별시 강남구 테헤란로 123"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave("brand")}>
                  <Save className="h-4 w-4 mr-1" />
                  {saved === "brand" ? "저장됨!" : "저장"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TopBar Config */}
        <TabsContent value="topbar" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Bell className="h-4 w-4" />
                상단 TopBar 설정
              </CardTitle>
              <CardDescription>페이지 최상단에 표시되는 프로모션 메시지 바를 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <Label>TopBar 활성화</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">{"비활성화하면 상단 바가 숨겨집니다."}</p>
                </div>
                <Switch
                  checked={topBar.isActive}
                  onCheckedChange={(v) => setTopBar({ ...topBar, isActive: v })}
                />
              </div>
              <div className="space-y-2">
                <Label>메시지 텍스트 *</Label>
                <Input
                  value={topBar.message}
                  onChange={(e) => setTopBar({ ...topBar, message: e.target.value })}
                  placeholder="회원가입 시 1,000원 쿠폰 즉시 지급!"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>링크 라벨</Label>
                  <Input
                    value={topBar.linkLabel || ""}
                    onChange={(e) => setTopBar({ ...topBar, linkLabel: e.target.value })}
                    placeholder="가입하기"
                  />
                </div>
                <div className="space-y-2">
                  <Label>링크 URL</Label>
                  <Input
                    value={topBar.linkUrl || ""}
                    onChange={(e) => setTopBar({ ...topBar, linkUrl: e.target.value })}
                    placeholder="/signup"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave("topbar")}>
                  <Save className="h-4 w-4 mr-1" />
                  {saved === "topbar" ? "저장됨!" : "저장"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* TopBar Preview */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">미리보기</CardTitle>
            </CardHeader>
            <CardContent>
              {topBar.isActive ? (
                <div className="bg-primary text-primary-foreground text-center py-2 px-4 rounded-lg text-sm">
                  <span>{topBar.message}</span>
                  {topBar.linkLabel && (
                    <span className="ml-2 underline font-medium cursor-pointer">{topBar.linkLabel}</span>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                  {"TopBar가 비활성화되어 있습니다."}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Config */}
        <TabsContent value="search" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Search className="h-4 w-4" />
                검색 설정
              </CardTitle>
              <CardDescription>헤더 검색창의 동작과 표시 설정입니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Placeholder 텍스트</Label>
                <Input
                  value={searchConfig.placeholder}
                  onChange={(e) => setSearchConfig({ ...searchConfig, placeholder: e.target.value })}
                  placeholder="상품을 검색해보세요"
                />
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <Label>드롭다운 자동완성</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">{"검색어 입력 시 자동완성 드롭다운 활성화"}</p>
                </div>
                <Switch
                  checked={searchConfig.dropdownEnabled}
                  onCheckedChange={(v) => setSearchConfig({ ...searchConfig, dropdownEnabled: v })}
                />
              </div>
              <div className="space-y-2">
                <Label>최대 자동완성 개수</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={searchConfig.maxSuggestions}
                  onChange={(e) => setSearchConfig({ ...searchConfig, maxSuggestions: Number(e.target.value) })}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave("search")}>
                  <Save className="h-4 w-4 mr-1" />
                  {saved === "search" ? "저장됨!" : "저장"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Preview */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">미리보기</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder={searchConfig.placeholder}
                    readOnly
                  />
                </div>
                {searchConfig.dropdownEnabled && (
                  <div className="mt-1 border border-border rounded-lg p-2 bg-card">
                    <p className="text-xs text-muted-foreground px-2 py-1">
                      {"자동완성 결과 (최대 "}{searchConfig.maxSuggestions}{"개)"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
