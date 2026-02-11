"use client"

import { useState } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  ArrowUpDown,
  Search,
  Hash,
  Link2,
  Menu,
  Smartphone,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockNavItems, mockPopularSearches } from "@/lib/mock-data"
import type { NavItem, PopularSearch } from "@/lib/types"

export function NavigationManage() {
  const [navItems, setNavItems] = useState<NavItem[]>(mockNavItems)
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>(mockPopularSearches)
  const [editNav, setEditNav] = useState<NavItem | null>(null)
  const [editSearch, setEditSearch] = useState<PopularSearch | null>(null)
  const [isNavDialogOpen, setIsNavDialogOpen] = useState(false)
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false)

  // Nav handlers
  const handleNavSave = () => {
    if (!editNav) return
    const exists = navItems.find((n) => n.id === editNav.id)
    if (exists) {
      setNavItems(navItems.map((n) => (n.id === editNav.id ? { ...editNav, updatedAt: new Date().toISOString() } : n)))
    } else {
      setNavItems([...navItems, editNav])
    }
    setIsNavDialogOpen(false)
    setEditNav(null)
  }

  const handleNavCreate = () => {
    const newItem: NavItem = {
      id: `n-${Date.now()}`,
      label: "",
      href: "/",
      sortOrder: navItems.length + 1,
      isActive: false,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "admin",
      updatedBy: "admin",
    }
    setEditNav(newItem)
    setIsNavDialogOpen(true)
  }

  const handleNavDelete = (id: string) => {
    setNavItems(navItems.filter((n) => n.id !== id))
  }

  const handleNavToggle = (id: string) => {
    setNavItems(navItems.map((n) => (n.id === id ? { ...n, isActive: !n.isActive } : n)))
  }

  // Search handlers
  const handleSearchSave = () => {
    if (!editSearch) return
    const exists = popularSearches.find((s) => s.id === editSearch.id)
    if (exists) {
      setPopularSearches(popularSearches.map((s) => (s.id === editSearch.id ? { ...editSearch, updatedAt: new Date().toISOString() } : s)))
    } else {
      setPopularSearches([...popularSearches, editSearch])
    }
    setIsSearchDialogOpen(false)
    setEditSearch(null)
  }

  const handleSearchCreate = () => {
    const newItem: PopularSearch = {
      id: `ps-${Date.now()}`,
      keyword: "",
      sortOrder: popularSearches.length + 1,
      isActive: false,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "admin",
      updatedBy: "admin",
    }
    setEditSearch(newItem)
    setIsSearchDialogOpen(true)
  }

  const handleSearchDelete = (id: string) => {
    setPopularSearches(popularSearches.filter((s) => s.id !== id))
  }

  const handleSearchToggle = (id: string) => {
    setPopularSearches(popularSearches.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s)))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">네비게이션 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {"헤더 메뉴, 인기검색어, 모바일 하단탭 등 네비게이션 요소를 관리합니다."}
        </p>
      </div>

      <Tabs defaultValue="header">
        <TabsList>
          <TabsTrigger value="header" className="gap-1.5">
            <Menu className="h-3.5 w-3.5" />
            헤더 메뉴
          </TabsTrigger>
          <TabsTrigger value="search" className="gap-1.5">
            <Search className="h-3.5 w-3.5" />
            인기검색어
          </TabsTrigger>
          <TabsTrigger value="mobile" className="gap-1.5">
            <Smartphone className="h-3.5 w-3.5" />
            모바일 하단탭
          </TabsTrigger>
        </TabsList>

        {/* Header Menu Tab */}
        <TabsContent value="header" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {"메인 네비게이션 항목을 관리합니다. 순서를 드래그하여 변경할 수 있습니다."}
            </p>
            <Button size="sm" onClick={handleNavCreate}>
              <Plus className="h-4 w-4 mr-1" />
              메뉴 추가
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead>순서</TableHead>
                    <TableHead>라벨</TableHead>
                    <TableHead>링크</TableHead>
                    <TableHead>활성</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {navItems
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="tabular-nums">
                            {item.sortOrder}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-foreground text-sm">{item.label}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Link2 className="h-3 w-3" />
                            {item.href}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={item.isActive}
                            onCheckedChange={() => handleNavToggle(item.id)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => { setEditNav({ ...item }); setIsNavDialogOpen(true) }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleNavDelete(item.id)}
                            >
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

          {/* Navigation Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">미리보기</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-border rounded-lg p-4 bg-card">
                <nav className="flex items-center gap-6">
                  {navItems
                    .filter((n) => n.isActive)
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((item) => (
                      <span
                        key={item.id}
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        {item.label}
                      </span>
                    ))}
                </nav>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Popular Search Tab */}
        <TabsContent value="search" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {"검색창에 표시되는 인기검색어를 관리합니다."}
            </p>
            <Button size="sm" onClick={handleSearchCreate}>
              <Plus className="h-4 w-4 mr-1" />
              검색어 추가
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead>순서</TableHead>
                    <TableHead>키워드</TableHead>
                    <TableHead>활성</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {popularSearches
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="tabular-nums">
                            {item.sortOrder}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium text-foreground text-sm">{item.keyword}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={item.isActive}
                            onCheckedChange={() => handleSearchToggle(item.id)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => { setEditSearch({ ...item }); setIsSearchDialogOpen(true) }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleSearchDelete(item.id)}
                            >
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

          {/* Search Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">미리보기</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-border rounded-lg p-4 bg-card max-w-md">
                <div className="flex flex-wrap gap-2">
                  {popularSearches
                    .filter((s) => s.isActive)
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((item) => (
                      <Badge key={item.id} variant="secondary" className="text-xs cursor-pointer hover:bg-accent">
                        {item.keyword}
                      </Badge>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mobile Tab */}
        <TabsContent value="mobile" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">모바일 하단 네비게이션</CardTitle>
              <CardDescription>모바일 화면 하단에 표시되는 탭 항목을 관리합니다. 최대 5개까지 설정 가능합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-sm mx-auto">
                <div className="border border-border rounded-2xl overflow-hidden bg-card">
                  <div className="h-40 bg-muted flex items-center justify-center text-sm text-muted-foreground">
                    {"화면 콘텐츠 영역"}
                  </div>
                  <div className="border-t border-border p-2">
                    <div className="flex items-center justify-around">
                      {["홈", "카테고리", "검색", "찜", "마이"].map((tab) => (
                        <div key={tab} className="flex flex-col items-center gap-1 p-2">
                          <div className="h-5 w-5 rounded bg-muted" />
                          <span className="text-[10px] text-muted-foreground">{tab}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Nav Edit Dialog */}
      <Dialog open={isNavDialogOpen} onOpenChange={setIsNavDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editNav && navItems.find((n) => n.id === editNav.id) ? "메뉴 수정" : "메뉴 추가"}
            </DialogTitle>
            <DialogDescription>헤더 네비게이션 메뉴 항목을 설정합니다.</DialogDescription>
          </DialogHeader>
          {editNav && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nav-label">라벨 *</Label>
                <Input
                  id="nav-label"
                  value={editNav.label}
                  onChange={(e) => setEditNav({ ...editNav, label: e.target.value })}
                  placeholder="메뉴 라벨"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nav-href">링크 URL *</Label>
                <Input
                  id="nav-href"
                  value={editNav.href}
                  onChange={(e) => setEditNav({ ...editNav, href: e.target.value })}
                  placeholder="/category"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nav-order">순서</Label>
                <Input
                  id="nav-order"
                  type="number"
                  value={editNav.sortOrder}
                  onChange={(e) => setEditNav({ ...editNav, sortOrder: Number(e.target.value) })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNavDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleNavSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search Edit Dialog */}
      <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editSearch && popularSearches.find((s) => s.id === editSearch.id) ? "검색어 수정" : "검색어 추가"}
            </DialogTitle>
            <DialogDescription>인기검색어를 설정합니다.</DialogDescription>
          </DialogHeader>
          {editSearch && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search-keyword">키워드 *</Label>
                <Input
                  id="search-keyword"
                  value={editSearch.keyword}
                  onChange={(e) => setEditSearch({ ...editSearch, keyword: e.target.value })}
                  placeholder="검색어를 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="search-order">순서</Label>
                <Input
                  id="search-order"
                  type="number"
                  value={editSearch.sortOrder}
                  onChange={(e) => setEditSearch({ ...editSearch, sortOrder: Number(e.target.value) })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSearchDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSearchSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
