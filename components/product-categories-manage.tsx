"use client"

import Link from "next/link"
import { ArrowLeft, Check, Plus, Pencil, Trash2, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { mockProducts } from "@/lib/mock-data"
import {
  DEFAULT_PRODUCT_CATEGORY_TREE,
  flattenCategoryTree,
  joinCategoryPath,
  readProductCategoryTreeFromStorage,
  writeProductCategoryTreeToStorage,
} from "@/lib/product-categories-storage"
import type { ProductCategoryNode } from "@/lib/product-categories-storage"
import { readProductsFromStorage, writeProductsToStorage } from "@/lib/products-storage"
import type { Product } from "@/lib/types"

function normalizeValue(value: string) {
  return value.trim()
}

function createCategoryId() {
  return `cat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function getChildrenByPath(nodes: ProductCategoryNode[], pathIds: string[]) {
  if (pathIds.length === 0) return nodes

  const [currentId, ...rest] = pathIds
  const currentNode = nodes.find((node) => node.id === currentId)
  if (!currentNode) return []

  if (rest.length === 0) {
    return currentNode.children
  }

  return getChildrenByPath(currentNode.children, rest)
}

function updateChildrenByPath(
  nodes: ProductCategoryNode[],
  pathIds: string[],
  updater: (children: ProductCategoryNode[]) => ProductCategoryNode[],
): ProductCategoryNode[] {
  if (pathIds.length === 0) {
    return updater(nodes)
  }

  const [currentId, ...rest] = pathIds

  return nodes.map((node) => {
    if (node.id !== currentId) return node

    if (rest.length === 0) {
      return {
        ...node,
        children: updater(node.children),
      }
    }

    return {
      ...node,
      children: updateChildrenByPath(node.children, rest, updater),
    }
  })
}

function replaceCategoryPathPrefix(current: string, oldPrefix: string, newPrefix: string) {
  if (current === oldPrefix) {
    return newPrefix
  }

  if (current.startsWith(`${oldPrefix} > `)) {
    return `${newPrefix}${current.slice(oldPrefix.length)}`
  }

  return current
}

export function ProductCategoriesManage() {
  const NONE_VALUE = "__none__"

  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [categoryTree, setCategoryTree] = useState<ProductCategoryNode[]>(DEFAULT_PRODUCT_CATEGORY_TREE)
  const [newCategory, setNewCategory] = useState("")
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState("")
  const [selectedDepth1Id, setSelectedDepth1Id] = useState("")
  const [selectedDepth2Id, setSelectedDepth2Id] = useState("")
  const [selectedDepth3Id, setSelectedDepth3Id] = useState("")
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const storedProducts = readProductsFromStorage()
    if (storedProducts) {
      setProducts(storedProducts)
    }

    const storedTree = readProductCategoryTreeFromStorage()
    if (storedTree && storedTree.length > 0) {
      setCategoryTree(storedTree)
    }

    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (!isInitialized) return
    writeProductCategoryTreeToStorage(categoryTree)
  }, [categoryTree, isInitialized])

  const depth1Options = categoryTree

  const depth2Options = useMemo(() => {
    if (!selectedDepth1Id) return []
    return getChildrenByPath(categoryTree, [selectedDepth1Id])
  }, [categoryTree, selectedDepth1Id])

  const depth3Options = useMemo(() => {
    if (!selectedDepth1Id || !selectedDepth2Id) return []
    return getChildrenByPath(categoryTree, [selectedDepth1Id, selectedDepth2Id])
  }, [categoryTree, selectedDepth1Id, selectedDepth2Id])

  const flatRows = useMemo(() => {
    const flattened = flattenCategoryTree(categoryTree)

    return flattened.map((item) => {
      const nodeChildren = getChildrenByPath(categoryTree, item.pathIds)
      return {
        ...item,
        hasChildren: nodeChildren.length > 0,
      }
    })
  }, [categoryTree])

  const nodeInfoById = useMemo(() => {
    const map = new Map<string, (typeof flatRows)[number]>()
    for (const row of flatRows) {
      map.set(row.id, row)
    }
    return map
  }, [flatRows])

  const usageCountMap = useMemo(() => {
    const usage = new Map<string, number>()

    for (const row of flatRows) {
      usage.set(row.id, 0)
    }

    for (const product of products) {
      const categoryValue = product.category.trim()
      if (!categoryValue) continue

      for (const row of flatRows) {
        if (
          categoryValue === row.value ||
          categoryValue.startsWith(`${row.value} > `)
        ) {
          usage.set(row.id, (usage.get(row.id) || 0) + 1)
        }
      }
    }

    return usage
  }, [flatRows, products])

  const parentPathIds = useMemo(() => {
    if (selectedDepth1Id && selectedDepth2Id && selectedDepth3Id) {
      return [selectedDepth1Id, selectedDepth2Id, selectedDepth3Id]
    }
    if (selectedDepth1Id && selectedDepth2Id) {
      return [selectedDepth1Id, selectedDepth2Id]
    }
    if (selectedDepth1Id) {
      return [selectedDepth1Id]
    }
    return []
  }, [selectedDepth1Id, selectedDepth2Id, selectedDepth3Id])

  const nextDepth = parentPathIds.length + 1
  const canAddDepth = nextDepth <= 4

  const parentPathNames = useMemo(() => {
    const parentRow = parentPathIds.length > 0 ? nodeInfoById.get(parentPathIds[parentPathIds.length - 1]) : null
    return parentRow?.pathNames || []
  }, [nodeInfoById, parentPathIds])

  const handleAdd = () => {
    const value = normalizeValue(newCategory)
    if (!value) return
    if (!canAddDepth) return

    let hasDuplicate = false

    const nextTree = updateChildrenByPath(categoryTree, parentPathIds, (children) => {
      if (children.some((node) => node.name === value)) {
        hasDuplicate = true
        return children
      }

      return [...children, { id: createCategoryId(), name: value, children: [] }]
    })

    if (hasDuplicate) return

    setCategoryTree(nextTree)
    setNewCategory("")
  }

  const handleStartEdit = (nodeId: string) => {
    const target = nodeInfoById.get(nodeId)
    if (!target) return

    setEditingNodeId(nodeId)
    setEditingValue(target.pathNames[target.pathNames.length - 1])
  }

  const handleCancelEdit = () => {
    setEditingNodeId(null)
    setEditingValue("")
  }

  const handleSaveEdit = (nodeId: string) => {
    const value = normalizeValue(editingValue)
    if (!value) return

    const target = nodeInfoById.get(nodeId)
    if (!target) return

    const oldPath = target.value
    const oldName = target.pathNames[target.pathNames.length - 1]
    if (oldName === value) {
      setEditingNodeId(null)
      setEditingValue("")
      return
    }

    const parentPathIds = target.pathIds.slice(0, -1)
    let hasDuplicate = false

    const nextTree = updateChildrenByPath(categoryTree, parentPathIds, (children) => {
      if (children.some((node) => node.id !== nodeId && node.name === value)) {
        hasDuplicate = true
        return children
      }

      return children.map((node) => (node.id === nodeId ? { ...node, name: value } : node))
    })

    if (hasDuplicate) return

    const newPath = joinCategoryPath([...target.pathNames.slice(0, -1), value])
    const nextProducts = products.map((product) => ({
      ...product,
      category: replaceCategoryPathPrefix(product.category, oldPath, newPath),
    }))

    setCategoryTree(nextTree)
    setProducts(nextProducts)
    writeProductsToStorage(nextProducts)
    setEditingNodeId(null)
    setEditingValue("")
  }

  const handleDelete = (nodeId: string) => {
    const target = nodeInfoById.get(nodeId)
    if (!target) return

    const hasChildren = target.hasChildren
    const usageCount = usageCountMap.get(nodeId) || 0
    if (hasChildren || usageCount > 0) return

    const parentPathIds = target.pathIds.slice(0, -1)

    const nextTree = updateChildrenByPath(categoryTree, parentPathIds, (children) =>
      children.filter((node) => node.id !== nodeId),
    )

    setCategoryTree(nextTree)

    if (selectedDepth1Id === nodeId) {
      setSelectedDepth1Id("")
      setSelectedDepth2Id("")
      setSelectedDepth3Id("")
    }
    if (selectedDepth2Id === nodeId) {
      setSelectedDepth2Id("")
      setSelectedDepth3Id("")
    }
    if (selectedDepth3Id === nodeId) {
      setSelectedDepth3Id("")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
            <Link href="/products">
              <ArrowLeft className="h-4 w-4 mr-1" />
              상품 관리로 돌아가기
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">카테고리 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            카테고리를 최대 4뎁스까지 구성하고 관리합니다.
          </p>
        </div>
        <Button asChild>
          <Link href="/products/new">상품 등록으로 이동</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>카테고리 추가</CardTitle>
          <CardDescription>
            상위 카테고리를 선택하면 다음 뎁스에 추가됩니다. 선택이 없으면 1뎁스로 추가됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Select
              value={selectedDepth1Id || NONE_VALUE}
              onValueChange={(value) => {
                const nextValue = value === NONE_VALUE ? "" : value
                setSelectedDepth1Id(nextValue)
                setSelectedDepth2Id("")
                setSelectedDepth3Id("")
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="1뎁스 선택(선택 안함 가능)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>선택 안함</SelectItem>
                {depth1Options.map((node) => (
                  <SelectItem key={node.id} value={node.id}>
                    {node.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedDepth2Id || NONE_VALUE}
              onValueChange={(value) => {
                const nextValue = value === NONE_VALUE ? "" : value
                setSelectedDepth2Id(nextValue)
                setSelectedDepth3Id("")
              }}
              disabled={depth2Options.length === 0}
            >
              <SelectTrigger>
              <SelectValue placeholder="2뎁스 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>선택 안함</SelectItem>
                {depth2Options.map((node) => (
                  <SelectItem key={node.id} value={node.id}>
                    {node.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedDepth3Id || NONE_VALUE}
              onValueChange={(value) => setSelectedDepth3Id(value === NONE_VALUE ? "" : value)}
              disabled={depth3Options.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="3뎁스 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>선택 안함</SelectItem>
                {depth3Options.map((node) => (
                  <SelectItem key={node.id} value={node.id}>
                    {node.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-category">추가할 카테고리명</Label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <Input
                id="new-category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="예: 세차/관리"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAdd()
                  }
                }}
              />
              <Button type="button" onClick={handleAdd} disabled={!canAddDepth}>
                <Plus className="h-4 w-4 mr-1" />
                {canAddDepth ? `${nextDepth}뎁스 추가` : "4뎁스까지만 추가 가능"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              현재 부모 경로: {parentPathNames.length > 0 ? parentPathNames.join(" > ") : "루트"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>카테고리 트리</CardTitle>
          <CardDescription>
            하위 카테고리가 있거나 상품이 연결된 카테고리는 삭제할 수 없습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>뎁스</TableHead>
                <TableHead>카테고리 경로</TableHead>
                <TableHead>연결 상품수</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flatRows.map((row) => {
                const usageCount = usageCountMap.get(row.id) || 0
                const canDelete = !row.hasChildren && usageCount === 0
                const isEditing = editingNodeId === row.id

                return (
                  <TableRow key={row.id}>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{row.depth}뎁스</span>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            className="h-8 max-w-xs"
                          />
                          <span className="text-xs text-muted-foreground">
                            (현재: {row.pathNames.join(" > ")})
                          </span>
                        </div>
                      ) : (
                        <span className="font-medium text-foreground">{row.pathNames.join(" > ")}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{usageCount}개</span>
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleSaveEdit(row.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleStartEdit(row.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDelete(row.id)}
                            disabled={!canDelete}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
