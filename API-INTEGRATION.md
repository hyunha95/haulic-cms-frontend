# API Integration Guide

프론트엔드(haulic-cms-frontend)와 백엔드(haulic) API 연결이 완료되었습니다.

## 변경 사항

### 1. 백엔드 CORS 설정 (haulic)

**파일**: `haulic/src/main/java/kr/co/haulic/cms/global/infrastructure/WebMvcConfig.java`

```java
// localhost:3000, localhost:3001에서의 API 요청 허용
registry.addMapping("/api/**")
    .allowedOrigins("http://localhost:3000", "http://localhost:3001")
    .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
    .allowedHeaders("*")
    .allowCredentials(true)
    .maxAge(3600);
```

### 2. 프론트엔드 환경변수 설정

**파일**: `haulic-cms-frontend/.env.local` (새로 생성됨)

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NODE_ENV=development
```

### 3. API 클라이언트 업데이트

**파일**: `haulic-cms-frontend/lib/api-client.ts`

- 환경변수에서 백엔드 URL 읽기
- 기본값: `http://localhost:8080`

### 4. Next.js Rewrites 설정

**파일**: `haulic-cms-frontend/next.config.mjs`

- `/api/*` 요청을 백엔드로 프록시
- CORS 문제 방지 및 개발 편의성 향상

## 실행 방법

### 1. 백엔드 실행 (haulic)

```bash
cd haulic

# PostgreSQL 시작
docker compose up -d

# 백엔드 실행 (포트 8080)
./gradlew bootRun
```

백엔드가 정상 실행되면 다음 로그를 확인할 수 있습니다:
```
Tomcat started on port 8080 (http)
```

### 2. 프론트엔드 실행 (haulic-cms-frontend)

```bash
cd haulic-cms-frontend

# 의존성 설치 (처음 한 번만)
pnpm install

# 개발 서버 실행 (포트 3000)
pnpm dev
```

프론트엔드가 정상 실행되면:
```
▲ Next.js 16.1.6
- Local:        http://localhost:3000
```

### 3. 상품 생성 테스트

1. 브라우저에서 `http://localhost:3000` 접속
2. 사이드바에서 "상품 관리" 클릭
3. "상품 등록" 버튼 클릭
4. 폼 입력:
   - **상품명**: 테스트 상품 (필수)
   - **카테고리**: Car > Interior > Diffuser (필수)
   - **판매가**: 3900 (필수)
   - **재고**: 100 (필수)
   - **상태**: draft / published / scheduled
   - **뱃지**: NEW / HOT (선택)
   - **정가**: 5900 (선택)
   - **활성화**: 체크박스
   - **이미지**: 대표/추가/상세 이미지 업로드 (선택)

5. "상품 저장" 버튼 클릭

## API 호출 흐름

### 상품 생성 (이미지 포함)

1. **이미지 업로드 준비**
   - `POST /api/admin/uploads/presign`
   - 각 이미지마다 presigned URL 발급

2. **S3에 이미지 업로드**
   - Presigned URL로 직접 업로드
   - 업로드 진행률 표시

3. **상품 생성**
   - `POST /api/admin/products`
   - 업로드된 이미지 URL과 함께 상품 정보 전송

4. **응답**
   - `201 Created`
   - `Location` 헤더: `/api/admin/products/{productId}`
   - 생성된 상품 정보 반환

## API 엔드포인트

### 상품 관리

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/admin/products` | 상품 목록 조회 (페이지네이션, 검색, 필터링) |
| GET | `/api/admin/products/{id}` | 상품 상세 조회 |
| POST | `/api/admin/products` | 상품 생성 |
| PUT | `/api/admin/products/{id}` | 상품 수정 |
| DELETE | `/api/admin/products/{id}` | 상품 삭제 |
| DELETE | `/api/admin/products?ids=...` | 상품 일괄 삭제 |
| GET | `/api/admin/products/{id}/recommendations` | 특정 상품 기반 추천 상품 목록 |
| GET | `/api/admin/products/recommendations` | 일반 추천 상품 목록 (인기/평점순) |

### 업로드 관리

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/admin/uploads/presign` | Presigned URL 발급 |

## 요청/응답 예시

### 1. Presigned URL 발급

**요청**:
```json
POST /api/admin/uploads/presign
{
  "fileName": "product-image.jpg",
  "contentType": "image/jpeg",
  "purpose": "product_main"
}
```

**응답**:
```json
{
  "uploadUrl": "https://s3.amazonaws.com/...",
  "fileUrl": "https://cdn.example.com/products/...",
  "objectKey": "products/xxx-yyy-zzz.jpg",
  "expiresInSeconds": 3600
}
```

### 2. 상품 생성

**요청**:
```json
POST /api/admin/products
{
  "name": "테스트 상품",
  "category": "Car > Interior > Diffuser",
  "price": 3900,
  "stock": 100,
  "status": "draft",
  "badge": "NEW",
  "originalPrice": 5900,
  "isActive": true,
  "image": "https://cdn.example.com/products/main.jpg",
  "additionalImages": [
    "https://cdn.example.com/products/add1.jpg",
    "https://cdn.example.com/products/add2.jpg"
  ],
  "detailDescriptionImage": "https://cdn.example.com/products/detail.jpg"
}
```

**응답**:
```json
HTTP/1.1 201 Created
Location: /api/admin/products/abc-123-def

{
  "id": "abc-123-def",
  "name": "테스트 상품",
  "category": "Car > Interior > Diffuser",
  "price": 3900,
  "stock": 100,
  "status": "draft",
  "badge": "NEW",
  "originalPrice": 5900,
  "isActive": true,
  "image": "https://cdn.example.com/products/main.jpg",
  "additionalImages": [...],
  "detailDescriptionImage": "https://cdn.example.com/products/detail.jpg",
  "rating": 0.0,
  "reviewCount": 0,
  "createdAt": "2026-02-13T12:34:56",
  "updatedAt": "2026-02-13T12:34:56",
  "createdBy": "system",
  "updatedBy": "system"
}
```

## 트러블슈팅

### CORS 오류 발생 시

**증상**: 콘솔에 `Access-Control-Allow-Origin` 오류

**해결**:
1. 백엔드가 실행 중인지 확인
2. `WebMvcConfig.java`의 CORS 설정 확인
3. 프론트엔드 포트가 3000 또는 3001인지 확인

### 연결 거부 (Connection Refused)

**증상**: `ERR_CONNECTION_REFUSED` 또는 `ECONNREFUSED`

**해결**:
1. 백엔드가 포트 8080에서 실행 중인지 확인
2. PostgreSQL이 실행 중인지 확인 (`docker compose ps`)
3. `.env.local`의 `NEXT_PUBLIC_API_BASE_URL` 확인

### Presigned URL 발급 실패

**증상**: 업로드 URL 발급 실패

**해결**:
1. AWS 자격증명 설정 확인
2. S3 버킷 설정 확인
3. 백엔드 로그 확인

### 이미지 업로드 실패

**증상**: S3 업로드 중 오류

**해결**:
1. 이미지 파일 형식 확인 (JPEG, PNG, WebP만 허용)
2. 파일 크기 확인
3. Presigned URL 만료 시간 확인 (1시간)

## 개발 팁

### DevTools에서 네트워크 확인

브라우저 개발자 도구 > Network 탭에서:
- Presign 요청 확인
- S3 업로드 진행 확인
- Product 생성 요청/응답 확인

### 백엔드 로그 확인

```bash
cd haulic
./gradlew bootRun

# 로그에서 확인:
# - CORS preflight 요청
# - API 요청/응답
# - 예외 스택 트레이스
```

### 데이터베이스 확인

```bash
docker compose exec postgres psql -U postgres -d cms

# 테이블 확인
\dt

# 생성된 상품 확인
SELECT * FROM products;
```

## 추천 상품 API

### 1. 특정 상품 기반 추천

**엔드포인트**: `GET /api/admin/products/{id}/recommendations`

같은 카테고리의 상품을 평점과 리뷰 수 순으로 추천합니다.

**쿼리 파라미터**:
- `limit` (선택): 추천 상품 개수 (기본값: 10)

**요청 예시**:
```
GET /api/admin/products/abc-123-def/recommendations?limit=5
```

**응답**:
```json
[
  {
    "id": "xyz-456-ghi",
    "name": "유사한 상품 1",
    "category": "Car > Interior > Diffuser",
    "price": 4200,
    "stock": 50,
    "status": "published",
    "badge": "HOT",
    "image": "https://cdn.example.com/products/similar1.jpg",
    "rating": 4.8,
    "reviewCount": 124,
    ...
  },
  ...
]
```

**특징**:
- 원본 상품과 같은 카테고리의 상품 반환
- 원본 상품은 제외됨
- 평점(rating) 내림차순 → 리뷰 수(reviewCount) 내림차순 정렬
- 상품이 없는 경우 빈 배열 반환

### 2. 일반 추천 (인기 상품)

**엔드포인트**: `GET /api/admin/products/recommendations`

전체 상품 중 평점과 리뷰 수가 높은 상품을 추천합니다.

**쿼리 파라미터**:
- `limit` (선택): 추천 상품 개수 (기본값: 10)

**요청 예시**:
```
GET /api/admin/products/recommendations?limit=20
```

**응답**: (동일한 상품 응답 형식)

**특징**:
- 모든 카테고리의 상품 대상
- 평점(rating) 내림차순 → 리뷰 수(reviewCount) 내림차순 정렬
- 메인 페이지나 사이드바에서 인기 상품 표시에 활용

### 사용 예시

#### 상품 상세 페이지
```typescript
// 같은 카테고리의 유사 상품 표시
const { data: recommendations } = useQuery({
  queryKey: ['product-recommendations', productId],
  queryFn: () => fetch(`/api/admin/products/${productId}/recommendations?limit=4`)
    .then(res => res.json())
})
```

#### 메인 대시보드
```typescript
// 인기 상품 표시
const { data: popular } = useQuery({
  queryKey: ['popular-products'],
  queryFn: () => fetch('/api/admin/products/recommendations?limit=10')
    .then(res => res.json())
})
```

## 다음 단계

- [x] 상품 목록 조회 API 연결
- [x] 상품 상세 조회 API 연결
- [x] 상품 수정/삭제 API 연결
- [x] 상품 추천 API 추가
- [ ] 카테고리 관리 API 연결
- [ ] 리뷰 관리 API 연결
