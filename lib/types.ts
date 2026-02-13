// =============================================
// 천원마켓 CMS 데이터 모델 타입 정의
// =============================================

// --- 공통 타입 ---
export type PublishStatus = "draft" | "published" | "scheduled"
export type Role = "super_admin" | "merchandiser" | "content_editor" | "cs_manager" | "viewer"

export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  status: PublishStatus
}

export interface VersionHistory {
  id: string
  entityId: string
  entityType: string
  modifiedBy: string
  modifiedAt: string
  changeSummary: string
}

// --- 사이트 설정 ---
export interface SiteMeta {
  title: string
  description: string
  themeColor: string
}

export interface BrandInfo {
  logoText: string
  csPhoneNumber: string // 한국식 전화번호 (예: 1588-1234)
  companyName: string
  ceoName: string
  businessNumber: string // 사업자등록번호
  address: string
}

// --- 네비게이션 ---
export interface NavItem extends BaseEntity {
  label: string
  href: string
  sortOrder: number
  isActive: boolean
}

export interface MegaMenuCategory extends BaseEntity {
  title: string
  sortOrder: number
  items: MegaMenuItem[]
}

export interface MegaMenuItem {
  id: string
  label: string
  href: string
  sortOrder: number
}

export interface PopularSearch extends BaseEntity {
  keyword: string
  sortOrder: number
  isActive: boolean
}

// --- 홈 화면 ---
export interface HeroSlide extends BaseEntity {
  title: string
  subtitle: string
  backgroundImage: string
  linkUrl: string
  sortOrder: number
  isActive: boolean
  scheduledStart?: string
  scheduledEnd?: string
}

export interface QuickShortcut extends BaseEntity {
  name: string
  iconName: string
  linkUrl: string
  sortOrder: number
  isActive: boolean
}

export interface RankingCategory {
  id: string
  label: string
  sortOrder: number
}

export interface RankingItem extends BaseEntity {
  categoryId: string
  productName: string
  price: number // 원
  originalPrice?: number
  image: string
  rating: number
  reviewCount: number
  badges: ("NEW" | "HOT")[]
  sortOrder: number
}

export interface WinterSectionItem extends BaseEntity {
  sectionTitle: string
  sectionLink: string
  productName: string
  price: number
  originalPrice?: number
  image: string
  sortOrder: number
}

// --- 상품 ---
export interface Product extends BaseEntity {
  name: string
  category: string
  price: number
  originalPrice?: number
  image: string
  additionalImages?: string[]
  detailDescriptionImage?: string
  rating: number
  reviewCount: number
  badge?: string
  stock: number
  isActive: boolean
}

export type ProductStatus = "draft" | "published" | "scheduled"
export type ProductBadge = "NEW" | "HOT"
export type UploadPurpose = "product_main" | "product_additional" | "product_detail"
export type AllowedUploadContentType = "image/jpeg" | "image/png" | "image/webp"

export interface CreateProductRequest {
  name: string
  category: string
  price: number
  stock: number
  status?: ProductStatus
  badge?: ProductBadge
  image?: string
  additionalImages?: string[]
  detailDescriptionImage?: string
  originalPrice?: number
  isActive?: boolean
}

export interface UpdateProductCommand {
  name: string
  category: string
  price: number
  stock: number
  status?: ProductStatus
  badge?: ProductBadge
  image?: string
  additionalImages?: string[]
  detailDescriptionImage?: string
  originalPrice?: number
  isActive?: boolean
}

export interface ProductResponse extends CreateProductRequest {
  id: string
  status: ProductStatus
  rating?: number
  reviewCount?: number
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  [key: string]: unknown
}

export interface PresignRequest {
  fileName: string
  contentType: AllowedUploadContentType
  purpose: UploadPurpose
}

export interface PresignResponse {
  uploadUrl: string
  fileUrl: string
  objectKey: string
  expiresInSeconds: number
}

export interface ApiFieldError {
  field: string
  message: string
}

export interface ApiErrorResponse {
  code: string
  message: string
  fieldErrors?: ApiFieldError[]
}

export interface ProductDetail {
  productId: string
  badges: string[]
  images: ProductImage[]
  categoryPath: string[]
  pointRate: number // %
  pointText: string
  deliveryInfo: DeliveryInfo
  pickupInfo?: string
  description: string[]
  specifications: ProductSpec[]
  starDistribution: Record<number, number>
}

export interface ProductImage {
  id: string
  url: string
  alt: string
  sortOrder: number
  isPrimary: boolean
}

export interface ProductSpec {
  label: string
  value: string
}

export interface DeliveryInfo {
  method: string
  estimatedArrival: string
  fee: number
  freeCondition?: string // 무료배송 조건 (예: "30,000원 이상")
}

export interface PaymentBenefit extends BaseEntity {
  title: string
  description: string
  discountRate?: number
  sortOrder: number
}

export interface RelatedProduct {
  id: string
  sourceProductId: string
  targetProductId: string
  sortOrder: number
}

// --- 기획전 ---
export interface ExhibitionPage extends BaseEntity {
  title: string
  slug: string
  breadcrumb: string[]
  filterSubcategories: FilterSubcategory[]
  sortOptions: string[]
  priceFilters: string[]
  deliveryFilters: string[]
}

export interface ExhibitionBanner extends BaseEntity {
  exhibitionId: string
  title: string
  subtitle?: string
  image: string
  linkUrl: string
  sortOrder: number
}

export interface FilterSubcategory {
  id: string
  label: string
  count: number
  sortOrder: number
}

// --- 리뷰 ---
export type ReviewModerationStatus = "visible" | "hidden" | "reported"

export interface Review extends BaseEntity {
  productId: string
  authorName: string // 마스킹된 이름
  rating: number // 1-5
  content: string
  hasPhoto: boolean
  photoUrls?: string[]
  helpfulCount: number
  purchaseOption?: string
  moderationStatus: ReviewModerationStatus
}

export interface SatisfactionMetric {
  id: string
  label: string
  percentage: number
  responseCount: number
}

// --- 푸터 ---
export interface FooterLinkGroup extends BaseEntity {
  title: string
  links: { label: string; href: string }[]
  sortOrder: number
}

export interface CompanyInfo extends BaseEntity {
  companyName: string
  ceoName: string
  businessNumber: string
  address: string
  csPhone: string
  csEmail: string
}

export interface SocialLink extends BaseEntity {
  platform: string
  url: string
  iconName: string
  sortOrder: number
}

export interface CertificationBadge extends BaseEntity {
  name: string
  image: string
  sortOrder: number
}

// --- 매장 ---
export interface PickupRegion {
  id: string
  name: string
  sortOrder: number
}

export interface PickupStore extends BaseEntity {
  regionId: string
  name: string
  address: string
  operatingStatus: "open" | "closed" | "temporary_closed"
  searchKeywords: string[]
  phone: string
  operatingHours: string
}

// --- 미디어 ---
export interface MediaItem extends BaseEntity {
  fileName: string
  url: string
  fileSize: number // bytes
  mimeType: string
  width?: number
  height?: number
  tags: string[]
  section?: string
}

// --- 프로모 그리드 ---
export interface PromoTile extends BaseEntity {
  type: "banner" | "product"
  row: number
  col: number
  title: string
  subtitle?: string
  price?: number
  originalPrice?: number
  image: string
  linkUrl: string
  sortOrder: number
}

// --- TopBar 설정 ---
export interface TopBarConfig extends BaseEntity {
  message: string
  linkUrl?: string
  linkLabel?: string
  isActive: boolean
}

// --- 검색 설정 ---
export interface SearchConfig extends BaseEntity {
  placeholder: string
  dropdownEnabled: boolean
  maxSuggestions: number
}

// --- 앱 다운로드 CTA ---
export interface AppDownloadCTA extends BaseEntity {
  title: string
  description: string
  iosLabel: string
  iosUrl: string
  androidLabel: string
  androidUrl: string
}

// --- 추천상품 섹션 ---
export interface RecommendedSection extends BaseEntity {
  sectionTitle: string
  productIds: string[]
  desktopCount: number
  mobileCount: number
  sortOrder: number
}

// --- 카테고리 랭킹 설정 ---
export interface CategoryRankingConfig {
  desktopItemsPerPage: number
  mobileItemsPerPage: number
  maxDisplayCount: number
  mobilePeekRatio: number
  mobileGap: number
}

// --- 모바일 하단 네비게이션 ---
export interface MobileTabItem extends BaseEntity {
  label: string
  href: string
  iconName: string
  sortOrder: number
  isActive: boolean
}

// --- 시스템 설정 ---
export interface SystemSettings {
  siteMeta: SiteMeta
  brandInfo: BrandInfo
  topBar: TopBarConfig
  searchConfig: SearchConfig
  appDownloadCTA: AppDownloadCTA
}
