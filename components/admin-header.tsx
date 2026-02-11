"use client"

import { Bell, Search } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"

const pageTitles: Record<string, string> = {
  "/": "대시보드",
  "/home-manage": "홈 관리",
  "/home-manage/hero": "히어로 배너",
  "/home-manage/shortcuts": "퀵 바로가기",
  "/home-manage/promo": "프로모 그리드",
  "/home-manage/ranking": "카테고리 랭킹",
  "/home-manage/app-cta": "앱 다운로드 CTA",
  "/products": "상품 관리",
  "/products/new": "상품 등록",
  "/products/categories": "카테고리 관리",
  "/exhibitions": "기획전/카테고리 관리",
  "/reviews": "리뷰 관리",
  "/navigation": "네비게이션 관리",
  "/navigation/header": "헤더 메뉴",
  "/navigation/mega-menu": "메가메뉴",
  "/navigation/popular-search": "인기검색어",
  "/navigation/mobile-tab": "모바일 하단탭",
  "/footer": "푸터/정책 관리",
  "/stores": "매장/배송 설정",
  "/media": "미디어 라이브러리",
  "/settings": "시스템 설정",
}

export function AdminHeader() {
  const pathname = usePathname()
  const pathParts = pathname.split("/").filter(Boolean)
  const currentTitle = pageTitles[pathname] || "페이지"

  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />

      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <span className="text-muted-foreground text-sm">천원마켓 CMS</span>
          </BreadcrumbItem>
          {pathParts.length > 0 && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm">{currentTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
          {pathParts.length === 0 && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm">대시보드</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="검색..."
            className="w-64 pl-8 h-9 bg-background"
          />
        </div>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground">
            3
          </Badge>
          <span className="sr-only">알림</span>
        </Button>
      </div>
    </header>
  )
}
