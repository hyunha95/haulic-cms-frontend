import type {
  HeroSlide,
  Product,
  Review,
  NavItem,
  QuickShortcut,
  ExhibitionPage,
  PickupStore,
  MediaItem,
  PopularSearch,
  PaymentBenefit,
  FooterLinkGroup,
  MegaMenuCategory,
  RankingCategory,
  RankingItem,
  PromoTile,
  SocialLink,
  CertificationBadge,
  CompanyInfo,
  MobileTabItem,
  WinterSectionItem,
  AppDownloadCTA,
  TopBarConfig,
  SearchConfig,
  SatisfactionMetric,
  PickupRegion,
} from "./types"

const now = new Date().toISOString()

export const mockHeroSlides: HeroSlide[] = [
  {
    id: "hs-1",
    title: "겨울 차량관리 특가전",
    subtitle: "최대 50% 할인",
    backgroundImage: "/images/hero-1.jpg",
    linkUrl: "/exhCtgr/winter-sale",
    sortOrder: 1,
    isActive: true,
    status: "published",
    scheduledStart: "2026-01-01T00:00:00Z",
    scheduledEnd: "2026-03-31T23:59:59Z",
    createdAt: now,
    updatedAt: now,
    createdBy: "admin",
    updatedBy: "admin",
  },
  {
    id: "hs-2",
    title: "봄맞이 인테리어 기획전",
    subtitle: "새 시즌 신상품 모음",
    backgroundImage: "/images/hero-2.jpg",
    linkUrl: "/exhCtgr/spring-interior",
    sortOrder: 2,
    isActive: true,
    status: "published",
    createdAt: now,
    updatedAt: now,
    createdBy: "admin",
    updatedBy: "admin",
  },
  {
    id: "hs-3",
    title: "주방용품 대전",
    subtitle: "1,000원부터 시작",
    backgroundImage: "/images/hero-3.jpg",
    linkUrl: "/exhCtgr/kitchen",
    sortOrder: 3,
    isActive: false,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    createdBy: "editor1",
    updatedBy: "editor1",
  },
]

export const mockProducts: Product[] = [
  {
    id: "p-1",
    name: "프리미엄 차량용 방향제 세트",
    category: "차량용품",
    price: 3900,
    originalPrice: 5900,
    image: "/images/product-1.jpg",
    rating: 4.5,
    reviewCount: 128,
    badge: "HOT",
    sku: "CAR-FR-001",
    isActive: true,
    status: "published",
    createdAt: now,
    updatedAt: now,
    createdBy: "admin",
    updatedBy: "admin",
  },
  {
    id: "p-2",
    name: "다용도 수납 정리함 3종",
    category: "생활용품",
    price: 1000,
    originalPrice: 2500,
    image: "/images/product-2.jpg",
    rating: 4.2,
    reviewCount: 89,
    badge: "NEW",
    sku: "LIV-ST-002",
    isActive: true,
    status: "published",
    createdAt: now,
    updatedAt: now,
    createdBy: "admin",
    updatedBy: "admin",
  },
  {
    id: "p-3",
    name: "스테인리스 텀블러 500ml",
    category: "주방용품",
    price: 4900,
    originalPrice: 8900,
    image: "/images/product-3.jpg",
    rating: 4.8,
    reviewCount: 234,
    sku: "KIT-TB-003",
    isActive: true,
    status: "published",
    createdAt: now,
    updatedAt: now,
    createdBy: "merchandiser1",
    updatedBy: "merchandiser1",
  },
  {
    id: "p-4",
    name: "LED 무선 충전 스탠드",
    category: "전자기기",
    price: 9900,
    originalPrice: 15900,
    image: "/images/product-4.jpg",
    rating: 4.6,
    reviewCount: 56,
    badge: "HOT",
    sku: "ELC-LD-004",
    isActive: true,
    status: "published",
    createdAt: now,
    updatedAt: now,
    createdBy: "admin",
    updatedBy: "admin",
  },
  {
    id: "p-5",
    name: "유기농 핸드크림 3종 세트",
    category: "뷰티",
    price: 2900,
    originalPrice: 5000,
    image: "/images/product-5.jpg",
    rating: 4.3,
    reviewCount: 167,
    badge: "NEW",
    sku: "BTY-HC-005",
    isActive: false,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    createdBy: "admin",
    updatedBy: "admin",
  },
  {
    id: "p-6",
    name: "실리콘 주방매트 대형",
    category: "주방용품",
    price: 1500,
    image: "/images/product-6.jpg",
    rating: 4.1,
    reviewCount: 42,
    sku: "KIT-MT-006",
    isActive: true,
    status: "published",
    createdAt: now,
    updatedAt: now,
    createdBy: "admin",
    updatedBy: "admin",
  },
]

export const mockReviews: Review[] = [
  {
    id: "r-1",
    productId: "p-1",
    authorName: "김*수",
    rating: 5,
    content: "차량에 달아놓으니 향이 은은하게 퍼져서 너무 좋아요. 가성비 최고입니다!",
    hasPhoto: true,
    photoUrls: ["/images/review-1.jpg"],
    helpfulCount: 23,
    purchaseOption: "라벤더 향",
    moderationStatus: "visible",
    status: "published",
    createdAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-02-01T10:00:00Z",
    createdBy: "user",
    updatedBy: "user",
  },
  {
    id: "r-2",
    productId: "p-2",
    authorName: "이*영",
    rating: 4,
    content: "정리함 사이즈가 딱 맞아서 좋습니다. 색상이 예뻐요.",
    hasPhoto: false,
    helpfulCount: 8,
    purchaseOption: "화이트",
    moderationStatus: "visible",
    status: "published",
    createdAt: "2026-02-03T14:30:00Z",
    updatedAt: "2026-02-03T14:30:00Z",
    createdBy: "user",
    updatedBy: "user",
  },
  {
    id: "r-3",
    productId: "p-1",
    authorName: "박*호",
    rating: 2,
    content: "향이 너무 강해서 환기를 해야 했습니다. 개인 취향 차이일 수 있지만...",
    hasPhoto: false,
    helpfulCount: 5,
    purchaseOption: "시트러스 향",
    moderationStatus: "reported",
    status: "published",
    createdAt: "2026-02-05T09:15:00Z",
    updatedAt: "2026-02-05T09:15:00Z",
    createdBy: "user",
    updatedBy: "user",
  },
  {
    id: "r-4",
    productId: "p-3",
    authorName: "최*미",
    rating: 5,
    content: "보온 보냉 기능이 뛰어나고 디자인도 세련됩니다. 출퇴근할 때 매일 사용 중!",
    hasPhoto: true,
    photoUrls: ["/images/review-2.jpg", "/images/review-3.jpg"],
    helpfulCount: 45,
    moderationStatus: "visible",
    status: "published",
    createdAt: "2026-02-07T16:00:00Z",
    updatedAt: "2026-02-07T16:00:00Z",
    createdBy: "user",
    updatedBy: "user",
  },
  {
    id: "r-5",
    productId: "p-4",
    authorName: "정*준",
    rating: 1,
    content: "불량품이 왔습니다. 교환 요청했습니다.",
    hasPhoto: true,
    photoUrls: ["/images/review-4.jpg"],
    helpfulCount: 2,
    moderationStatus: "hidden",
    status: "published",
    createdAt: "2026-02-08T11:20:00Z",
    updatedAt: "2026-02-08T11:20:00Z",
    createdBy: "user",
    updatedBy: "user",
  },
]

export const mockNavItems: NavItem[] = [
  { id: "n-1", label: "홈", href: "/", sortOrder: 1, isActive: true, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "n-2", label: "베스트", href: "/best", sortOrder: 2, isActive: true, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "n-3", label: "신상품", href: "/new", sortOrder: 3, isActive: true, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "n-4", label: "카테고리", href: "/category", sortOrder: 4, isActive: true, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "n-5", label: "기획전", href: "/exhibition", sortOrder: 5, isActive: true, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "n-6", label: "이벤트", href: "/event", sortOrder: 6, isActive: false, status: "draft", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
]

export const mockQuickShortcuts: QuickShortcut[] = [
  { id: "qs-1", name: "타임세일", iconName: "Clock", linkUrl: "/timesale", sortOrder: 1, isActive: true, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "qs-2", name: "쿠폰", iconName: "Ticket", linkUrl: "/coupon", sortOrder: 2, isActive: true, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "qs-3", name: "무료배송", iconName: "Truck", linkUrl: "/free-delivery", sortOrder: 3, isActive: true, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "qs-4", name: "신규가입", iconName: "UserPlus", linkUrl: "/signup-event", sortOrder: 4, isActive: true, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
]

export const mockExhibitions: ExhibitionPage[] = [
  {
    id: "ex-1",
    title: "겨울 차량관리 특가전",
    slug: "winter-car-care",
    breadcrumb: ["홈", "기획전", "겨울 차량관리 특가전"],
    filterSubcategories: [
      { id: "fs-1", label: "전체", count: 48, sortOrder: 1 },
      { id: "fs-2", label: "워셔액/부동액", count: 12, sortOrder: 2 },
      { id: "fs-3", label: "체인/스노우", count: 8, sortOrder: 3 },
      { id: "fs-4", label: "방향제", count: 15, sortOrder: 4 },
      { id: "fs-5", label: "세차용품", count: 13, sortOrder: 5 },
    ],
    sortOptions: ["추천순", "최신순", "가격낮은순", "가격높은순", "리뷰많은순"],
    priceFilters: ["전체", "~1,000원", "1,000~3,000원", "3,000~5,000원", "5,000원~"],
    deliveryFilters: ["전체", "일반배송", "빠른배송", "매장픽업"],
    status: "published",
    createdAt: now,
    updatedAt: now,
    createdBy: "admin",
    updatedBy: "admin",
  },
  {
    id: "ex-2",
    title: "봄맞이 인테리어 기획전",
    slug: "spring-interior",
    breadcrumb: ["홈", "기획전", "봄맞이 인테리어"],
    filterSubcategories: [
      { id: "fs-6", label: "전체", count: 32, sortOrder: 1 },
      { id: "fs-7", label: "수납/정리", count: 10, sortOrder: 2 },
      { id: "fs-8", label: "조명", count: 8, sortOrder: 3 },
    ],
    sortOptions: ["추천순", "최신순", "가격낮은순", "가격높은순"],
    priceFilters: ["전체", "~3,000원", "3,000~5,000원", "5,000원~"],
    deliveryFilters: ["전체", "일반배송", "빠른배송"],
    status: "draft",
    createdAt: now,
    updatedAt: now,
    createdBy: "editor1",
    updatedBy: "editor1",
  },
]

export const mockStores: PickupStore[] = [
  {
    id: "st-1",
    regionId: "r-seoul",
    name: "강남점",
    address: "서울특별시 강남구 테헤란로 123",
    operatingStatus: "open",
    searchKeywords: ["강남", "테헤란로", "역삼"],
    phone: "02-1234-5678",
    operatingHours: "09:00 - 22:00",
    status: "published",
    createdAt: now,
    updatedAt: now,
    createdBy: "admin",
    updatedBy: "admin",
  },
  {
    id: "st-2",
    regionId: "r-seoul",
    name: "홍대점",
    address: "서울특별시 마포구 양화로 45",
    operatingStatus: "open",
    searchKeywords: ["홍대", "마포", "합정"],
    phone: "02-2345-6789",
    operatingHours: "10:00 - 21:00",
    status: "published",
    createdAt: now,
    updatedAt: now,
    createdBy: "admin",
    updatedBy: "admin",
  },
  {
    id: "st-3",
    regionId: "r-gyeonggi",
    name: "수원점",
    address: "경기도 수원시 영통구 광교로 200",
    operatingStatus: "temporary_closed",
    searchKeywords: ["수원", "광교", "영통"],
    phone: "031-345-6789",
    operatingHours: "09:00 - 21:00",
    status: "published",
    createdAt: now,
    updatedAt: now,
    createdBy: "admin",
    updatedBy: "admin",
  },
]

export const mockPopularSearches: PopularSearch[] = [
  { id: "ps-1", keyword: "방향제", sortOrder: 1, isActive: true, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "ps-2", keyword: "수납함", sortOrder: 2, isActive: true, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "ps-3", keyword: "텀블러", sortOrder: 3, isActive: true, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "ps-4", keyword: "LED 조명", sortOrder: 4, isActive: true, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "ps-5", keyword: "핸드크림", sortOrder: 5, isActive: false, status: "draft", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
]

export const mockPaymentBenefits: PaymentBenefit[] = [
  { id: "pb-1", title: "카카오페이 결제", description: "3,000원 이상 결제 시 300원 할인", discountRate: 10, sortOrder: 1, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "pb-2", title: "네이버페이 결제", description: "첫 결제 시 500원 할인", discountRate: 15, sortOrder: 2, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "pb-3", title: "신한카드 결제", description: "5,000원 이상 결제 시 10% 할인", discountRate: 10, sortOrder: 3, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
]

export const mockFooterLinkGroups: FooterLinkGroup[] = [
  {
    id: "fg-1",
    title: "고객센터",
    links: [
      { label: "자주묻는질문", href: "/faq" },
      { label: "1:1 문의", href: "/inquiry" },
      { label: "공지사항", href: "/notice" },
    ],
    sortOrder: 1,
    status: "published",
    createdAt: now,
    updatedAt: now,
    createdBy: "admin",
    updatedBy: "admin",
  },
  {
    id: "fg-2",
    title: "회사 소개",
    links: [
      { label: "회사소개", href: "/about" },
      { label: "채용정보", href: "/careers" },
      { label: "입점문의", href: "/partnership" },
    ],
    sortOrder: 2,
    status: "published",
    createdAt: now,
    updatedAt: now,
    createdBy: "admin",
    updatedBy: "admin",
  },
]

export const mockMedia: MediaItem[] = [
  { id: "m-1", fileName: "hero-banner-winter.jpg", url: "/images/hero-1.jpg", fileSize: 245000, mimeType: "image/jpeg", width: 1920, height: 600, tags: ["배너", "히어로", "겨울"], section: "hero", status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "m-2", fileName: "product-airfresh.jpg", url: "/images/product-1.jpg", fileSize: 89000, mimeType: "image/jpeg", width: 800, height: 800, tags: ["상품", "방향제"], section: "product", status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "m-3", fileName: "promo-spring.jpg", url: "/images/promo-1.jpg", fileSize: 156000, mimeType: "image/jpeg", width: 1200, height: 400, tags: ["프로모션", "봄"], section: "promotion", status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "m-4", fileName: "logo-badge.png", url: "/images/badge-1.png", fileSize: 12000, mimeType: "image/png", width: 120, height: 120, tags: ["인증", "배지"], section: "footer", status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
]

export const mockMegaMenuCategories: MegaMenuCategory[] = [
  {
    id: "mm-1", title: "차량용품", sortOrder: 1, status: "published",
    items: [
      { id: "mmi-1", label: "방향제", href: "/category/car/air-freshener", sortOrder: 1 },
      { id: "mmi-2", label: "세차용품", href: "/category/car/wash", sortOrder: 2 },
      { id: "mmi-3", label: "수납/정리", href: "/category/car/storage", sortOrder: 3 },
    ],
    createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin",
  },
  {
    id: "mm-2", title: "생활용품", sortOrder: 2, status: "published",
    items: [
      { id: "mmi-4", label: "수납함", href: "/category/living/storage", sortOrder: 1 },
      { id: "mmi-5", label: "청소용품", href: "/category/living/cleaning", sortOrder: 2 },
    ],
    createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin",
  },
  {
    id: "mm-3", title: "주방용품", sortOrder: 3, status: "published",
    items: [
      { id: "mmi-6", label: "조리도구", href: "/category/kitchen/tools", sortOrder: 1 },
      { id: "mmi-7", label: "텀블러/보틀", href: "/category/kitchen/tumbler", sortOrder: 2 },
      { id: "mmi-8", label: "주방매트", href: "/category/kitchen/mat", sortOrder: 3 },
    ],
    createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin",
  },
]

export const mockRankingCategories: RankingCategory[] = [
  { id: "rc-1", label: "전체", sortOrder: 1 },
  { id: "rc-2", label: "차량용품", sortOrder: 2 },
  { id: "rc-3", label: "생활용품", sortOrder: 3 },
  { id: "rc-4", label: "주방용품", sortOrder: 4 },
  { id: "rc-5", label: "뷰티", sortOrder: 5 },
]

export const mockRankingItems: RankingItem[] = [
  { id: "ri-1", categoryId: "rc-2", productName: "프리미엄 차량용 방향제", price: 3900, originalPrice: 5900, image: "/images/product-1.jpg", rating: 4.5, reviewCount: 128, badges: ["HOT"], sortOrder: 1, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "ri-2", categoryId: "rc-3", productName: "다용도 수납 정리함 3종", price: 1000, originalPrice: 2500, image: "/images/product-2.jpg", rating: 4.2, reviewCount: 89, badges: ["NEW"], sortOrder: 2, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "ri-3", categoryId: "rc-4", productName: "스테인리스 텀블러 500ml", price: 4900, originalPrice: 8900, image: "/images/product-3.jpg", rating: 4.8, reviewCount: 234, badges: [], sortOrder: 3, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
]

export const mockPromoTiles: PromoTile[] = [
  { id: "pt-1", type: "banner", row: 1, col: 1, title: "겨울 특가전", subtitle: "최대 50% 할인", image: "/images/promo-1.jpg", linkUrl: "/exhCtgr/winter", sortOrder: 1, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "pt-2", type: "product", row: 1, col: 2, title: "차량용 방향제", price: 3900, originalPrice: 5900, image: "/images/product-1.jpg", linkUrl: "/product/1", sortOrder: 2, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "pt-3", type: "product", row: 2, col: 1, title: "수납 정리함", price: 1000, originalPrice: 2500, image: "/images/product-2.jpg", linkUrl: "/product/2", sortOrder: 3, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "pt-4", type: "banner", row: 2, col: 2, title: "신상품 기획전", subtitle: "봄맞이 인테리어", image: "/images/promo-2.jpg", linkUrl: "/exhCtgr/spring", sortOrder: 4, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
]

export const mockSocialLinks: SocialLink[] = [
  { id: "sl-1", platform: "Instagram", url: "https://instagram.com/1000market", iconName: "Instagram", sortOrder: 1, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "sl-2", platform: "YouTube", url: "https://youtube.com/1000market", iconName: "Youtube", sortOrder: 2, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "sl-3", platform: "KakaoTalk", url: "https://pf.kakao.com/1000market", iconName: "MessageCircle", sortOrder: 3, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
]

export const mockCertBadges: CertificationBadge[] = [
  { id: "cb-1", name: "KCP 안심결제", image: "/images/badge-kcp.png", sortOrder: 1, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "cb-2", name: "ISMS 인증", image: "/images/badge-isms.png", sortOrder: 2, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
]

export const mockCompanyInfo: CompanyInfo = {
  id: "ci-1", companyName: "(주)천원마켓", ceoName: "홍길동", businessNumber: "123-45-67890",
  address: "서울특별시 강남구 테헤란로 123, 15층", csPhone: "1588-1000", csEmail: "cs@1000market.co.kr",
  status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin",
}

export const mockMobileTabItems: MobileTabItem[] = [
  { id: "mt-1", label: "홈", href: "/", iconName: "Home", sortOrder: 1, isActive: true, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "mt-2", label: "카테고리", href: "/category", iconName: "Grid3X3", sortOrder: 2, isActive: true, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "mt-3", label: "검색", href: "/search", iconName: "Search", sortOrder: 3, isActive: true, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "mt-4", label: "장바구니", href: "/cart", iconName: "ShoppingCart", sortOrder: 4, isActive: true, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "mt-5", label: "마이페이지", href: "/mypage", iconName: "User", sortOrder: 5, isActive: true, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
]

export const mockWinterSectionItems: WinterSectionItem[] = [
  { id: "ws-1", sectionTitle: "겨울 차량관리", sectionLink: "/exhCtgr/winter-car", productName: "에탄올 워셔액 4L", price: 1000, originalPrice: 2500, image: "/images/winter-1.jpg", sortOrder: 1, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "ws-2", sectionTitle: "겨울 차량관리", sectionLink: "/exhCtgr/winter-car", productName: "부동액 1L", price: 3900, originalPrice: 5900, image: "/images/winter-2.jpg", sortOrder: 2, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
  { id: "ws-3", sectionTitle: "겨울 차량관리", sectionLink: "/exhCtgr/winter-car", productName: "스노우 체인 세트", price: 9900, image: "/images/winter-3.jpg", sortOrder: 3, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin" },
]

export const mockAppDownloadCTA: AppDownloadCTA = {
  id: "cta-1", title: "천원마켓 앱 다운로드", description: "앱에서만 받을 수 있는 특별 혜택! 지금 다운로드하세요.",
  iosLabel: "App Store", iosUrl: "https://apps.apple.com/1000market",
  androidLabel: "Google Play", androidUrl: "https://play.google.com/1000market",
  status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin",
}

export const mockTopBarConfig: TopBarConfig = {
  id: "tb-1", message: "회원가입 시 1,000원 쿠폰 즉시 지급!", linkUrl: "/signup", linkLabel: "가입하기",
  isActive: true, status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin",
}

export const mockSearchConfig: SearchConfig = {
  id: "sc-1", placeholder: "상품을 검색해보세요", dropdownEnabled: true, maxSuggestions: 8,
  status: "published", createdAt: now, updatedAt: now, createdBy: "admin", updatedBy: "admin",
}

export const mockSatisfactionMetrics: SatisfactionMetric[] = [
  { id: "sm-1", label: "배송 만족도", percentage: 92, responseCount: 4521 },
  { id: "sm-2", label: "상품 품질", percentage: 88, responseCount: 3842 },
  { id: "sm-3", label: "가격 만족도", percentage: 95, responseCount: 5103 },
  { id: "sm-4", label: "CS 응대", percentage: 87, responseCount: 1256 },
]

export const mockPickupRegions: PickupRegion[] = [
  { id: "r-seoul", name: "서울", sortOrder: 1 },
  { id: "r-gyeonggi", name: "경기", sortOrder: 2 },
  { id: "r-incheon", name: "인천", sortOrder: 3 },
  { id: "r-busan", name: "부산", sortOrder: 4 },
]

// 대시보드 통계
export const dashboardStats = {
  totalProducts: 1284,
  activeProducts: 1102,
  totalReviews: 8943,
  pendingReviews: 23,
  totalOrders: 15632,
  todayOrders: 342,
  totalRevenue: 156320000,
  monthlyRevenue: 23450000,
}

export const recentActivity = [
  { id: "a-1", action: "상품 등록", target: "프리미엄 차량용 방향제 세트", user: "김관리자", time: "5분 전" },
  { id: "a-2", action: "리뷰 숨김 처리", target: "리뷰 #r-5", user: "이모더레이터", time: "12분 ���" },
  { id: "a-3", action: "기획전 수정", target: "겨울 차량관리 특가전", user: "박에디터", time: "30분 전" },
  { id: "a-4", action: "배너 발행", target: "봄맞이 인테리어 기획전", user: "박에디터", time: "1시간 전" },
  { id: "a-5", action: "매장 정보 수정", target: "강남점 운영시간 변경", user: "최매니저", time: "2시간 전" },
  { id: "a-6", action: "상품 가격 수정", target: "다용도 수납 정리함 3종", user: "김관리자", time: "3시간 전" },
]
