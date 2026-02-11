import type { Product } from "@/lib/types"

const PRODUCTS_STORAGE_KEY = "haulic-cms-products"

export function createNewProduct(): Product {
  const now = new Date().toISOString()
  return {
    id: `p-${Date.now()}`,
    name: "",
    category: "",
    price: 0,
    image: "",
    additionalImages: [],
    detailDescriptionImage: "",
    rating: 0,
    reviewCount: 0,
    stock: 0,
    isActive: false,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    createdBy: "admin",
    updatedBy: "admin",
  }
}

export function readProductsFromStorage(): Product[] | null {
  if (typeof window === "undefined") {
    return null
  }

  const raw = window.localStorage.getItem(PRODUCTS_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return null
    }
    return parsed.map((item) => ({
      ...item,
      stock: typeof item?.stock === "number" ? item.stock : 0,
      additionalImages: Array.isArray(item?.additionalImages)
        ? item.additionalImages.filter((image: unknown): image is string => typeof image === "string")
        : [],
      detailDescriptionImage:
        typeof item?.detailDescriptionImage === "string" ? item.detailDescriptionImage : "",
    })) as Product[]
  } catch {
    return null
  }
}

export function writeProductsToStorage(products: Product[]) {
  if (typeof window === "undefined") {
    return
  }
  window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products))
}
