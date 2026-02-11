"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { useEffect, useState } from "react"

import { KcCertificationSection } from "@/components/kc-certification-section"
import { ProductFormFields } from "@/components/product-form-fields"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockProducts } from "@/lib/mock-data"
import {
  DEFAULT_PRODUCT_CATEGORY_TREE,
  readProductCategoryTreeFromStorage,
} from "@/lib/product-categories-storage"
import { createNewProduct, readProductsFromStorage, writeProductsToStorage } from "@/lib/products-storage"
import type { Product } from "@/lib/types"

export function ProductsCreate() {
  const router = useRouter()
  const [product, setProduct] = useState<Product>(() => createNewProduct())
  const [categoryTree, setCategoryTree] = useState(DEFAULT_PRODUCT_CATEGORY_TREE)

  useEffect(() => {
    const storedCategoryTree = readProductCategoryTreeFromStorage()
    if (storedCategoryTree && storedCategoryTree.length > 0) {
      setCategoryTree(storedCategoryTree)
    }
  }, [])

  const canSave =
    product.name.trim().length > 0 &&
    product.category.trim().length > 0 &&
    product.price > 0 &&
    Number.isFinite(product.stock) &&
    product.stock >= 0

  const handleSave = (status: Product["status"]) => {
    const now = new Date().toISOString()
    const nextProduct = {
      ...product,
      status,
      createdAt: product.createdAt || now,
      updatedAt: now,
      updatedBy: "admin",
    }

    const storedProducts = readProductsFromStorage() ?? mockProducts
    writeProductsToStorage([nextProduct, ...storedProducts])
    router.push("/products")
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
          <h1 className="text-2xl font-bold text-foreground">상품 등록</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {"신규 상품 정보를 입력하고 저장하세요."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/products">취소</Link>
          </Button>
          <Button variant="outline" onClick={() => handleSave("draft")}>
            임시저장
          </Button>
          <Button onClick={() => handleSave(product.status)} disabled={!canSave}>
            <Save className="h-4 w-4 mr-1" />
            저장
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>상품 기본 정보</CardTitle>
          <CardDescription>모든 정보를 하나의 화면에서 입력하고 저장하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductFormFields
            product={product}
            categoryTree={categoryTree}
            onChange={setProduct}
          />
        </CardContent>
      </Card>

      <KcCertificationSection />
    </div>
  )
}
