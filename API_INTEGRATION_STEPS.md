# 프론트엔드-백엔드 API 연동 완료

## ✅ 백엔드에 추가된 API 엔드포인트

### 상품 조회
- `GET /api/admin/products` - 상품 목록 조회 (페이지네이션, 필터링)
  - Query params: `category`, `name`, `page`, `size`, `sort`, `direction`
- `GET /api/admin/products/{id}` - 상품 상세 조회

### 상품 생성
- `POST /api/admin/products` - 상품 생성 (이미 구현됨)

### 상품 수정
- `PUT /api/admin/products/{id}` - 상품 수정

### 상품 삭제
- `DELETE /api/admin/products/{id}` - 상품 삭제
- `DELETE /api/admin/products?ids=...&ids=...` - 상품 일괄 삭제

## ✅ 백엔드에 추가된 파일

### Use Cases
- `FindProductsUseCase.java` - 상품 목록 조회 인터페이스
- `FindProductByIdUseCase.java` - 상품 상세 조회 인터페이스
- `UpdateProductUseCase.java` - 상품 수정 인터페이스
- `DeleteProductUseCase.java` - 상품 삭제 인터페이스

### DTOs
- `UpdateProductCommand.java` - 상품 수정 커맨드
- `UpdateProductRequest.java` - 상품 수정 요청 DTO
- `ProductsResponse.java` - 상품 목록 응답 DTO (페이지네이션)

### Services
- `ProductQueryService.java` - 상품 조회 서비스
- `ProductCommandService.java` - 상품 생성/수정/삭제 서비스 (업데이트됨)

### Domain
- `Product.java` - `update()` 메서드 추가
- `ProductRepository.java` - 조회/삭제 메서드 추가
- `ProductNotFoundException.java` - 상품 없음 예외

### Infrastructure
- `SpringDataJpaProductRepository.java` - JPA 쿼리 메서드 추가
- `ProductRepositoryAdapter.java` - 어댑터 구현 추가

### Presentation
- `ProductController.java` - 모든 CRUD 엔드포인트 추가

### Exception Handler
- `ApiExceptionHandler.java` - `ProductNotFoundException` 핸들러 추가

## ✅ 프론트엔드에 추가된 파일

### Hooks
- `use-products.ts` - 상품 CRUD 훅
  - `useProducts(params)` - 상품 목록 조회
  - `useProduct(id)` - 상품 상세 조회
  - `useUpdateProduct()` - 상품 수정
  - `useDeleteProduct()` - 상품 삭제
  - `useBulkDeleteProducts()` - 상품 일괄 삭제

### Types
- `UpdateProductCommand` 인터페이스 추가
- `ProductResponse`에 `rating`, `reviewCount` 필드 추가

## 🔄 products-manage.tsx 컴포넌트 수정 방법

기존 `mockProducts` 사용 코드를 API 호출로 변경:

### 1. 상품 목록 조회

**변경 전:**
```tsx
const [products, setProducts] = useState<Product[]>(mockProducts)
```

**변경 후:**
```tsx
import { useProducts, useDeleteProduct, useBulkDeleteProducts } from "@/hooks/use-products"

// 컴포넌트 내부
const [page, setPage] = useState(0)
const [search, setSearch] = useState("")
const [categoryFilter, setCategoryFilter] = useState("")

const { data: productsPage, isLoading, error } = useProducts({
  name: search || undefined,
  category: categoryFilter !== "전체" ? categoryFilter : undefined,
  page,
  size: 10,
  sort: "createdAt",
  direction: "DESC",
})

const products = productsPage?.content ?? []
const totalPages = productsPage?.totalPages ?? 0
```

### 2. 상품 삭제

**변경 전:**
```tsx
const handleDelete = (id: string) => {
  setProducts(products.filter((p) => p.id !== id))
}
```

**변경 후:**
```tsx
const deleteMutation = useDeleteProduct()

const handleDelete = async (id: string) => {
  if (!confirm("정말 삭제하시겠습니까?")) return

  try {
    await deleteMutation.mutateAsync(id)
    // 성공 알림
  } catch (error) {
    // 에러 처리
  }
}
```

### 3. 일괄 삭제

**변경 전:**
```tsx
const handleBulkDelete = () => {
  setProducts(products.filter((p) => !selectedIds.includes(p.id)))
  setSelectedIds([])
}
```

**변경 후:**
```tsx
const bulkDeleteMutation = useBulkDeleteProducts()

const handleBulkDelete = async () => {
  if (!confirm(`${selectedIds.length}개 상품을 삭제하시겠습니까?`)) return

  try {
    await bulkDeleteMutation.mutateAsync(selectedIds)
    setSelectedIds([])
    // 성공 알림
  } catch (error) {
    // 에러 처리
  }
}
```

### 4. 상품 수정

**변경 전:**
```tsx
const handleSave = () => {
  if (!editProduct) return
  const exists = products.find((p) => p.id === editProduct.id)
  if (exists) {
    setProducts(products.map((p) =>
      p.id === editProduct.id ? { ...editProduct, updatedAt: new Date().toISOString() } : p
    ))
  }
  setIsDialogOpen(false)
}
```

**변경 후:**
```tsx
import { useUpdateProduct } from "@/hooks/use-products"

const updateMutation = useUpdateProduct()

const handleSave = async () => {
  if (!editProduct) return

  try {
    await updateMutation.mutateAsync({
      id: editProduct.id,
      data: {
        name: editProduct.name,
        category: editProduct.category,
        price: editProduct.price,
        stock: editProduct.stock,
        status: editProduct.status,
        badge: editProduct.badge,
        image: editProduct.image,
        additionalImages: editProduct.additionalImages,
        detailDescriptionImage: editProduct.detailDescriptionImage,
        originalPrice: editProduct.originalPrice,
        isActive: editProduct.isActive,
      },
    })
    setIsDialogOpen(false)
    setEditProduct(null)
    // 성공 알림
  } catch (error) {
    // 에러 처리
  }
}
```

### 5. 로딩 및 에러 처리

```tsx
if (isLoading) {
  return <div>로딩 중...</div>
}

if (error) {
  return <div>에러 발생: {error.message}</div>
}
```

## 🧪 테스트 방법

### 1. 백엔드 실행
```bash
cd haulic
docker compose up -d
./gradlew bootRun
```

### 2. 프론트엔드 실행
```bash
cd haulic-cms-frontend
pnpm dev
```

### 3. 브라우저에서 테스트
1. `http://localhost:3000` 접속
2. 상품 관리 메뉴로 이동
3. 다음 기능 테스트:
   - ✅ 상품 목록 조회 (페이지네이션)
   - ✅ 상품 검색 (이름으로)
   - ✅ 카테고리 필터링
   - ✅ 상품 생성
   - ✅ 상품 수정
   - ✅ 상품 삭제
   - ✅ 일괄 삭제

## 📝 API 요청/응답 예시

### GET /api/admin/products

**요청:**
```
GET /api/admin/products?page=0&size=10&sort=createdAt&direction=DESC
```

**응답:**
```json
{
  "content": [
    {
      "id": "abc-123",
      "name": "테스트 상품",
      "category": "Car > Interior",
      "price": 3900,
      "stock": 100,
      "status": "published",
      "badge": "NEW",
      "image": "https://...",
      "additionalImages": ["https://..."],
      "detailDescriptionImage": "https://...",
      "originalPrice": 5900,
      "isActive": true,
      "rating": 4.5,
      "reviewCount": 10,
      "createdAt": "2026-02-13T12:00:00",
      "updatedAt": "2026-02-13T12:00:00",
      "createdBy": "system",
      "updatedBy": "system"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

### PUT /api/admin/products/{id}

**요청:**
```json
{
  "name": "수정된 상품명",
  "category": "Car > Interior > Diffuser",
  "price": 4900,
  "stock": 150,
  "status": "published",
  "badge": "HOT",
  "isActive": true
}
```

**응답:**
```json
{
  "id": "abc-123",
  "name": "수정된 상품명",
  ...
}
```

## ⚠️ 주의사항

1. **환경변수 확인**: `.env.local`에서 `NEXT_PUBLIC_API_BASE_URL=http://localhost:18080` 설정 확인
2. **CORS 설정**: 백엔드에서 이미 localhost:3000 허용됨
3. **페이지네이션**: 백엔드는 0-based 인덱스 사용 (page=0이 첫 페이지)
4. **Query Invalidation**: 상품 생성/수정/삭제 후 자동으로 목록 새로고침
5. **에러 처리**: `ApiRequestError` 타입으로 에러 핸들링

## 다음 단계

- [ ] products-manage.tsx를 API 기반으로 완전히 마이그레이션
- [ ] 로딩 스피너 및 에러 메시지 UI 개선
- [ ] 성공/실패 토스트 알림 추가
- [ ] 상품 이미지 업로드 플로우 통합
- [ ] 페이지네이션 컴포넌트 개선
