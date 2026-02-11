"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Home,
  Package,
  Tag,
  Star,
  Navigation,
  FileText,
  MapPin,
  ImageIcon,
  Settings,
  ChevronDown,
  Store,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"

const mainMenuItems = [
  {
    title: "대시보드",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    title: "홈 관리",
    icon: Home,
    href: "/home-manage",
    sub: [
      { title: "히어로 배너", href: "/home-manage/hero" },
      { title: "퀵 바로가기", href: "/home-manage/shortcuts" },
      { title: "프로모 그리드", href: "/home-manage/promo" },
      { title: "카테고리 랭킹", href: "/home-manage/ranking" },
      { title: "앱 다운로드 CTA", href: "/home-manage/app-cta" },
    ],
  },
  {
    title: "상품 관리",
    icon: Package,
    href: "/products",
    sub: [
      { title: "상품 목록", href: "/products" },
      { title: "상품 등록", href: "/products/new" },
      { title: "카테고리 관리", href: "/products/categories" },
    ],
  },
  {
    title: "기획전/카테고리",
    icon: Tag,
    href: "/exhibitions",
  },
  {
    title: "리뷰 관리",
    icon: Star,
    href: "/reviews",
    badge: "23",
  },
]

const settingsMenuItems = [
  {
    title: "네비게이션 관리",
    icon: Navigation,
    href: "/navigation",
    sub: [
      { title: "헤더 메뉴", href: "/navigation/header" },
      { title: "메가메뉴", href: "/navigation/mega-menu" },
      { title: "인기검색어", href: "/navigation/popular-search" },
      { title: "모바일 하단탭", href: "/navigation/mobile-tab" },
    ],
  },
  {
    title: "푸터/정책",
    icon: FileText,
    href: "/footer",
  },
  {
    title: "매장/배송 설정",
    icon: MapPin,
    href: "/stores",
  },
  {
    title: "미디어 라이브러리",
    icon: ImageIcon,
    href: "/media",
  },
  {
    title: "시스템 설정",
    icon: Settings,
    href: "/settings",
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border pb-4">
        <Link href="/" className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Store className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold text-sidebar-foreground">
              {"천원마켓"}
            </span>
            <span className="text-xs text-sidebar-foreground/60">CMS</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>콘텐츠 관리</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) =>
                item.sub ? (
                  <Collapsible key={item.href} defaultOpen={pathname.startsWith(item.href)}>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={pathname.startsWith(item.href)}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.sub.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.href}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === subItem.href}
                              >
                                <Link href={subItem.href}>{subItem.title}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge
                            variant="secondary"
                            className="ml-auto bg-sidebar-accent text-sidebar-accent-foreground text-[10px] px-1.5 py-0"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>설정</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsMenuItems.map((item) =>
                item.sub ? (
                  <Collapsible key={item.href} defaultOpen={pathname.startsWith(item.href)}>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={pathname.startsWith(item.href)}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.sub.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.href}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === subItem.href}
                              >
                                <Link href={subItem.href}>{subItem.title}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            {"관"}
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-xs font-medium text-sidebar-foreground">관리자</span>
            <span className="text-[10px] text-sidebar-foreground/60">super_admin</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
