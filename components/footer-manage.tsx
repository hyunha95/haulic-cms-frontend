"use client"

import { useState } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  Building2,
  Link2,
  Shield,
  Share2,
  Save,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  mockFooterLinkGroups,
  mockCompanyInfo,
  mockSocialLinks,
  mockCertBadges,
} from "@/lib/mock-data"
import type { FooterLinkGroup, CompanyInfo, SocialLink, CertificationBadge, PublishStatus } from "@/lib/types"

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { label: string; className: string }> = {
    published: { label: "발행됨", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    draft: { label: "초안", className: "bg-amber-100 text-amber-700 border-amber-200" },
  }
  const v = variants[status] || variants.draft
  return <Badge variant="outline" className={v.className}>{v.label}</Badge>
}

export function FooterManage() {
  // Footer link groups
  const [linkGroups, setLinkGroups] = useState<FooterLinkGroup[]>(mockFooterLinkGroups)
  const [editGroup, setEditGroup] = useState<FooterLinkGroup | null>(null)
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false)

  // Company info
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(mockCompanyInfo)
  const [companySaved, setCompanySaved] = useState(false)

  // Social links
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(mockSocialLinks)
  const [editSocial, setEditSocial] = useState<SocialLink | null>(null)
  const [isSocialDialogOpen, setIsSocialDialogOpen] = useState(false)

  // Certification badges
  const [certBadges, setCertBadges] = useState<CertificationBadge[]>(mockCertBadges)
  const [editBadge, setEditBadge] = useState<CertificationBadge | null>(null)
  const [isBadgeDialogOpen, setIsBadgeDialogOpen] = useState(false)

  // Link Group handlers
  const handleGroupCreate = () => {
    const now = new Date().toISOString()
    const newGroup: FooterLinkGroup = {
      id: `fg-${Date.now()}`, title: "", links: [], sortOrder: linkGroups.length + 1,
      status: "draft", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin",
    }
    setEditGroup(newGroup)
    setIsGroupDialogOpen(true)
  }

  const handleGroupSave = () => {
    if (!editGroup) return
    const exists = linkGroups.find((g) => g.id === editGroup.id)
    if (exists) {
      setLinkGroups(linkGroups.map((g) => (g.id === editGroup.id ? { ...editGroup, updatedAt: new Date().toISOString() } : g)))
    } else {
      setLinkGroups([...linkGroups, editGroup])
    }
    setIsGroupDialogOpen(false)
    setEditGroup(null)
  }

  const handleGroupDelete = (id: string) => setLinkGroups(linkGroups.filter((g) => g.id !== id))

  const handleAddLink = () => {
    if (!editGroup) return
    setEditGroup({ ...editGroup, links: [...editGroup.links, { label: "", href: "" }] })
  }

  const handleUpdateLink = (index: number, field: "label" | "href", value: string) => {
    if (!editGroup) return
    const updated = [...editGroup.links]
    updated[index] = { ...updated[index], [field]: value }
    setEditGroup({ ...editGroup, links: updated })
  }

  const handleRemoveLink = (index: number) => {
    if (!editGroup) return
    setEditGroup({ ...editGroup, links: editGroup.links.filter((_, i) => i !== index) })
  }

  // Company info handler
  const handleCompanySave = () => {
    setCompanyInfo({ ...companyInfo, updatedAt: new Date().toISOString() })
    setCompanySaved(true)
    setTimeout(() => setCompanySaved(false), 2000)
  }

  // Social link handlers
  const handleSocialCreate = () => {
    const now = new Date().toISOString()
    const newSocial: SocialLink = {
      id: `sl-${Date.now()}`, platform: "", url: "", iconName: "", sortOrder: socialLinks.length + 1,
      status: "draft", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin",
    }
    setEditSocial(newSocial)
    setIsSocialDialogOpen(true)
  }

  const handleSocialSave = () => {
    if (!editSocial) return
    const exists = socialLinks.find((s) => s.id === editSocial.id)
    if (exists) {
      setSocialLinks(socialLinks.map((s) => (s.id === editSocial.id ? { ...editSocial, updatedAt: new Date().toISOString() } : s)))
    } else {
      setSocialLinks([...socialLinks, editSocial])
    }
    setIsSocialDialogOpen(false)
    setEditSocial(null)
  }

  const handleSocialDelete = (id: string) => setSocialLinks(socialLinks.filter((s) => s.id !== id))

  // Badge handlers
  const handleBadgeCreate = () => {
    const now = new Date().toISOString()
    const newBadge: CertificationBadge = {
      id: `cb-${Date.now()}`, name: "", image: "", sortOrder: certBadges.length + 1,
      status: "draft", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin",
    }
    setEditBadge(newBadge)
    setIsBadgeDialogOpen(true)
  }

  const handleBadgeSave = () => {
    if (!editBadge) return
    const exists = certBadges.find((b) => b.id === editBadge.id)
    if (exists) {
      setCertBadges(certBadges.map((b) => (b.id === editBadge.id ? { ...editBadge, updatedAt: new Date().toISOString() } : b)))
    } else {
      setCertBadges([...certBadges, editBadge])
    }
    setIsBadgeDialogOpen(false)
    setEditBadge(null)
  }

  const handleBadgeDelete = (id: string) => setCertBadges(certBadges.filter((b) => b.id !== id))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">푸터/정책 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {"푸터 링크, 회사 정보, 소셜 링크, 인증 배지를 관리합니다."}
        </p>
      </div>

      <Tabs defaultValue="links">
        <TabsList>
          <TabsTrigger value="links" className="gap-1.5">
            <Link2 className="h-3.5 w-3.5" />
            푸터 링크
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            회사 정보
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-1.5">
            <Share2 className="h-3.5 w-3.5" />
            소셜 링크
          </TabsTrigger>
          <TabsTrigger value="badges" className="gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            인증 배지
          </TabsTrigger>
        </TabsList>

        {/* Footer Link Groups */}
        <TabsContent value="links" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{"푸터에 표시되는 링크 그룹을 관리합니다."}</p>
            <Button size="sm" onClick={handleGroupCreate}>
              <Plus className="h-4 w-4 mr-1" />
              링크 그룹 추가
            </Button>
          </div>

          {linkGroups.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                {"등록된 링크 그룹이 없습니다."}
              </CardContent>
            </Card>
          ) : (
            linkGroups.sort((a, b) => a.sortOrder - b.sortOrder).map((group) => (
              <Card key={group.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-semibold text-foreground">{group.title}</CardTitle>
                      <StatusBadge status={group.status} />
                      <Badge variant="secondary" className="text-[10px]">{group.links.length}개 링크</Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditGroup({ ...group }); setIsGroupDialogOpen(true) }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleGroupDelete(group.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1">
                    {group.links.map((link, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Link2 className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-foreground">{link.label}</span>
                        <span className="text-muted-foreground text-xs">→ {link.href}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Company Info */}
        <TabsContent value="company" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">회사 정보</CardTitle>
              <CardDescription>푸터에 표시되는 사업자 정보를 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>회사명 *</Label>
                  <Input value={companyInfo.companyName} onChange={(e) => setCompanyInfo({ ...companyInfo, companyName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>대표자명 *</Label>
                  <Input value={companyInfo.ceoName} onChange={(e) => setCompanyInfo({ ...companyInfo, ceoName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>사업자등록번호 *</Label>
                  <Input value={companyInfo.businessNumber} onChange={(e) => setCompanyInfo({ ...companyInfo, businessNumber: e.target.value })} placeholder="123-45-67890" />
                </div>
                <div className="space-y-2">
                  <Label>고객센터 전화번호</Label>
                  <Input value={companyInfo.csPhone} onChange={(e) => setCompanyInfo({ ...companyInfo, csPhone: e.target.value })} placeholder="1588-1000" />
                </div>
                <div className="space-y-2">
                  <Label>고객센터 이메일</Label>
                  <Input value={companyInfo.csEmail} onChange={(e) => setCompanyInfo({ ...companyInfo, csEmail: e.target.value })} placeholder="cs@example.co.kr" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>주소</Label>
                  <Input value={companyInfo.address} onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleCompanySave}>
                  <Save className="h-4 w-4 mr-1" />
                  {companySaved ? "저장됨!" : "저장"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Links */}
        <TabsContent value="social" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{"푸터에 표시되는 소셜 미디어 링크를 관리합니다."}</p>
            <Button size="sm" onClick={handleSocialCreate}>
              <Plus className="h-4 w-4 mr-1" />
              소셜 링크 추가
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>플랫폼</TableHead>
                    <TableHead>아이콘</TableHead>
                    <TableHead className="hidden md:table-cell">URL</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {socialLinks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        {"등록된 소셜 링크가 없습니다."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    socialLinks.sort((a, b) => a.sortOrder - b.sortOrder).map((link) => (
                      <TableRow key={link.id}>
                        <TableCell className="font-medium text-foreground">{link.platform}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{link.iconName}</Badge></TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground truncate max-w-[200px]">{link.url}</TableCell>
                        <TableCell><StatusBadge status={link.status} /></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditSocial({ ...link }); setIsSocialDialogOpen(true) }}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleSocialDelete(link.id)}>
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

        {/* Certification Badges */}
        <TabsContent value="badges" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{"푸터에 표시되는 인증 배지/마크를 관리합니다."}</p>
            <Button size="sm" onClick={handleBadgeCreate}>
              <Plus className="h-4 w-4 mr-1" />
              인증 배지 추가
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certBadges.length === 0 ? (
              <Card className="sm:col-span-2 lg:col-span-3">
                <CardContent className="py-12 text-center text-muted-foreground">
                  {"등록된 인증 배지가 없습니다."}
                </CardContent>
              </Card>
            ) : (
              certBadges.sort((a, b) => a.sortOrder - b.sortOrder).map((badge) => (
                <Card key={badge.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-muted border border-border flex items-center justify-center">
                          <Shield className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{badge.name}</p>
                          <p className="text-xs text-muted-foreground">순서: {badge.sortOrder}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditBadge({ ...badge }); setIsBadgeDialogOpen(true) }}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleBadgeDelete(badge.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Link Group Edit Dialog */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editGroup && linkGroups.find((g) => g.id === editGroup.id) ? "링크 그룹 수정" : "링크 그룹 추가"}
            </DialogTitle>
            <DialogDescription>푸터 링크 그룹 제목과 하위 링크를 설정합니다.</DialogDescription>
          </DialogHeader>
          {editGroup && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>그룹 제목 *</Label>
                <Input value={editGroup.title} onChange={(e) => setEditGroup({ ...editGroup, title: e.target.value })} placeholder="고객센터" />
              </div>
              <div className="space-y-2">
                <Label>링크 목록</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {editGroup.links.map((link, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input value={link.label} onChange={(e) => handleUpdateLink(i, "label", e.target.value)} placeholder="라벨" className="flex-1" />
                      <Input value={link.href} onChange={(e) => handleUpdateLink(i, "href", e.target.value)} placeholder="/path" className="flex-1" />
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => handleRemoveLink(i)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={handleAddLink}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  링크 추가
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>취소</Button>
            <Button onClick={handleGroupSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Social Link Edit Dialog */}
      <Dialog open={isSocialDialogOpen} onOpenChange={setIsSocialDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editSocial && socialLinks.find((s) => s.id === editSocial.id) ? "소셜 링크 수정" : "소셜 링크 추가"}
            </DialogTitle>
            <DialogDescription>소셜 미디어 링크를 설정합니다.</DialogDescription>
          </DialogHeader>
          {editSocial && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>플랫폼명 *</Label>
                <Input value={editSocial.platform} onChange={(e) => setEditSocial({ ...editSocial, platform: e.target.value })} placeholder="Instagram" />
              </div>
              <div className="space-y-2">
                <Label>아이콘 이름</Label>
                <Input value={editSocial.iconName} onChange={(e) => setEditSocial({ ...editSocial, iconName: e.target.value })} placeholder="Instagram" />
              </div>
              <div className="space-y-2">
                <Label>URL *</Label>
                <Input value={editSocial.url} onChange={(e) => setEditSocial({ ...editSocial, url: e.target.value })} placeholder="https://instagram.com/..." />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSocialDialogOpen(false)}>취소</Button>
            <Button onClick={handleSocialSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Badge Edit Dialog */}
      <Dialog open={isBadgeDialogOpen} onOpenChange={setIsBadgeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editBadge && certBadges.find((b) => b.id === editBadge.id) ? "인증 배지 수정" : "인증 배지 추가"}
            </DialogTitle>
            <DialogDescription>인증/보안 배지를 설정합니다.</DialogDescription>
          </DialogHeader>
          {editBadge && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>배지명 *</Label>
                <Input value={editBadge.name} onChange={(e) => setEditBadge({ ...editBadge, name: e.target.value })} placeholder="KCP 안심결제" />
              </div>
              <div className="space-y-2">
                <Label>이미지 URL</Label>
                <Input value={editBadge.image} onChange={(e) => setEditBadge({ ...editBadge, image: e.target.value })} placeholder="/images/badge-kcp.png" />
              </div>
              <div className="space-y-2">
                <Label>순서</Label>
                <Input type="number" value={editBadge.sortOrder} onChange={(e) => setEditBadge({ ...editBadge, sortOrder: Number(e.target.value) })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBadgeDialogOpen(false)}>취소</Button>
            <Button onClick={handleBadgeSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
