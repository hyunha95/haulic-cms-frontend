export interface ProductCategoryNode {
  id: string
  name: string
  children: ProductCategoryNode[]
}

export interface ProductCategoryPath {
  id: string
  depth: number
  pathIds: string[]
  pathNames: string[]
  value: string
}

const PRODUCT_CATEGORIES_STORAGE_KEY = "haulic-cms-product-categories"
const CATEGORY_PATH_SEPARATOR = " > "
const MAX_CATEGORY_DEPTH = 4

function createCategoryId() {
  return `cat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const DEFAULT_PRODUCT_CATEGORY_TREE: ProductCategoryNode[] = [
  { id: "cat-1", name: "차량용품", children: [] },
  { id: "cat-2", name: "생활용품", children: [] },
  { id: "cat-3", name: "주방용품", children: [] },
  { id: "cat-4", name: "전자기기", children: [] },
  { id: "cat-5", name: "뷰티", children: [] },
]

function normalizeTree(nodes: ProductCategoryNode[], depth = 1): ProductCategoryNode[] {
  if (!Array.isArray(nodes) || depth > MAX_CATEGORY_DEPTH) {
    return []
  }

  const normalized: ProductCategoryNode[] = []
  const seenNames = new Set<string>()

  for (const rawNode of nodes) {
    if (!rawNode || typeof rawNode !== "object") continue

    const name = String(rawNode.name ?? "").trim()
    if (!name) continue
    if (seenNames.has(name)) continue

    seenNames.add(name)

    normalized.push({
      id: String(rawNode.id ?? createCategoryId()),
      name,
      children:
        depth < MAX_CATEGORY_DEPTH
          ? normalizeTree(Array.isArray(rawNode.children) ? rawNode.children : [], depth + 1)
          : [],
    })
  }

  return normalized
}

function migrateLegacyCategories(value: unknown): ProductCategoryNode[] | null {
  if (!Array.isArray(value)) return null
  if (value.every((item) => typeof item === "string")) {
    return normalizeTree(
      value.map((name) => ({
        id: createCategoryId(),
        name,
        children: [],
      })),
    )
  }
  return null
}

function parseStoredTree(raw: string): ProductCategoryNode[] | null {
  try {
    const parsed = JSON.parse(raw)

    const migrated = migrateLegacyCategories(parsed)
    if (migrated) {
      return migrated
    }

    if (!Array.isArray(parsed)) {
      return null
    }

    return normalizeTree(parsed as ProductCategoryNode[])
  } catch {
    return null
  }
}

export function readProductCategoryTreeFromStorage(): ProductCategoryNode[] | null {
  if (typeof window === "undefined") {
    return null
  }

  const raw = window.localStorage.getItem(PRODUCT_CATEGORIES_STORAGE_KEY)
  if (!raw) {
    return null
  }

  const tree = parseStoredTree(raw)
  if (!tree || tree.length === 0) {
    return null
  }

  return tree
}

export function writeProductCategoryTreeToStorage(tree: ProductCategoryNode[]) {
  if (typeof window === "undefined") {
    return
  }

  const normalized = normalizeTree(tree)
  window.localStorage.setItem(PRODUCT_CATEGORIES_STORAGE_KEY, JSON.stringify(normalized))
}

export function getProductCategoryTree() {
  return readProductCategoryTreeFromStorage() ?? DEFAULT_PRODUCT_CATEGORY_TREE
}

export function joinCategoryPath(pathNames: string[]) {
  return pathNames.join(CATEGORY_PATH_SEPARATOR)
}

export function splitCategoryPath(path: string) {
  return path
    .split(CATEGORY_PATH_SEPARATOR)
    .map((value) => value.trim())
    .filter(Boolean)
}

export function flattenCategoryTree(tree: ProductCategoryNode[]) {
  const flat: ProductCategoryPath[] = []

  const walk = (nodes: ProductCategoryNode[], pathIds: string[], pathNames: string[], depth: number) => {
    for (const node of nodes) {
      const nextPathIds = [...pathIds, node.id]
      const nextPathNames = [...pathNames, node.name]

      flat.push({
        id: node.id,
        depth,
        pathIds: nextPathIds,
        pathNames: nextPathNames,
        value: joinCategoryPath(nextPathNames),
      })

      if (node.children.length > 0 && depth < MAX_CATEGORY_DEPTH) {
        walk(node.children, nextPathIds, nextPathNames, depth + 1)
      }
    }
  }

  walk(tree, [], [], 1)
  return flat
}

export function getCategoryPathNamesByIds(tree: ProductCategoryNode[], pathIds: string[]) {
  if (pathIds.length === 0) return []

  const names: string[] = []
  let currentNodes = tree

  for (const id of pathIds) {
    const node = currentNodes.find((item) => item.id === id)
    if (!node) break

    names.push(node.name)
    currentNodes = node.children
  }

  return names
}

export function findCategoryPathIdsByValue(tree: ProductCategoryNode[], value: string) {
  const pathValue = value.trim()
  if (!pathValue) return []

  const flat = flattenCategoryTree(tree)

  const exactPath = flat.find((item) => item.value === pathValue)
  if (exactPath) {
    return exactPath.pathIds
  }

  const parts = splitCategoryPath(pathValue)
  if (parts.length > 0) {
    const byNames = flat.find(
      (item) => item.pathNames.length === parts.length && item.pathNames.every((name, idx) => name === parts[idx]),
    )
    if (byNames) {
      return byNames.pathIds
    }
  }

  const byName = flat.find((item) => item.pathNames[item.pathNames.length - 1] === pathValue)
  if (byName) {
    return byName.pathIds
  }

  return []
}
