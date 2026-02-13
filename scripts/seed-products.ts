/**
 * 더미 상품 데이터 생성 스크립트
 *
 * 실행 방법:
 * pnpm tsx scripts/seed-products.ts
 */

import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:18080'

interface CreateProductPayload {
  name: string
  category: string
  price: number
  stock: number
  status: 'draft' | 'published' | 'scheduled'
  badge?: 'NEW' | 'HOT'
  originalPrice?: number
  isActive: boolean
}

const DUMMY_PRODUCTS: CreateProductPayload[] = [
  // 스낵/과자
  {
    name: '허니버터칩 60g',
    category: '스낵/과자',
    price: 1500,
    stock: 100,
    status: 'published',
    badge: 'HOT',
    originalPrice: 2000,
    isActive: true,
  },
  {
    name: '새우깡 90g',
    category: '스낵/과자',
    price: 1200,
    stock: 150,
    status: 'published',
    isActive: true,
  },
  {
    name: '포카칩 오리지널 66g',
    category: '스낵/과자',
    price: 1300,
    stock: 80,
    status: 'published',
    badge: 'NEW',
    isActive: true,
  },
  {
    name: '오감자 75g',
    category: '스낵/과자',
    price: 1400,
    stock: 120,
    status: 'published',
    isActive: true,
  },
  {
    name: '치토스 콘스프 82g',
    category: '스낵/과자',
    price: 1500,
    stock: 90,
    status: 'published',
    isActive: true,
  },

  // 음료
  {
    name: '코카콜라 350ml',
    category: '음료',
    price: 1000,
    stock: 200,
    status: 'published',
    badge: 'HOT',
    isActive: true,
  },
  {
    name: '포카리스웨트 500ml',
    category: '음료',
    price: 1200,
    stock: 150,
    status: 'published',
    isActive: true,
  },
  {
    name: '데미소다 사과 250ml',
    category: '음료',
    price: 800,
    stock: 100,
    status: 'published',
    badge: 'NEW',
    isActive: true,
  },
  {
    name: '밀키스 250ml',
    category: '음료',
    price: 900,
    stock: 130,
    status: 'published',
    isActive: true,
  },
  {
    name: '비타500 100ml',
    category: '음료',
    price: 1000,
    stock: 180,
    status: 'published',
    isActive: true,
  },

  // 라면/즉석식품
  {
    name: '신라면 120g',
    category: '라면/즉석식품',
    price: 1000,
    stock: 300,
    status: 'published',
    badge: 'HOT',
    isActive: true,
  },
  {
    name: '진라면 매운맛 120g',
    category: '라면/즉석식품',
    price: 1000,
    stock: 250,
    status: 'published',
    isActive: true,
  },
  {
    name: '불닭볶음면 140g',
    category: '라면/즉석식품',
    price: 1200,
    stock: 200,
    status: 'published',
    badge: 'HOT',
    isActive: true,
  },
  {
    name: '짜파게티 140g',
    category: '라면/즉석식품',
    price: 1000,
    stock: 180,
    status: 'published',
    isActive: true,
  },
  {
    name: '너구리 120g',
    category: '라면/즉석식품',
    price: 1000,
    stock: 220,
    status: 'published',
    isActive: true,
  },

  // 초콜릿/캔디
  {
    name: '빼빼로 오리지널 39g',
    category: '초콜릿/캔디',
    price: 1000,
    stock: 160,
    status: 'published',
    badge: 'NEW',
    isActive: true,
  },
  {
    name: '칸초 42g',
    category: '초콜릿/캔디',
    price: 1000,
    stock: 140,
    status: 'published',
    isActive: true,
  },
  {
    name: '가나초콜릿 50g',
    category: '초콜릿/캔디',
    price: 1500,
    stock: 120,
    status: 'published',
    isActive: true,
  },
  {
    name: '쌀롱카 31g',
    category: '초콜릿/캔디',
    price: 800,
    stock: 100,
    status: 'published',
    badge: 'NEW',
    isActive: true,
  },
  {
    name: '마이쮸 오리지널 57g',
    category: '초콜릿/캔디',
    price: 1000,
    stock: 110,
    status: 'published',
    isActive: true,
  },

  // 아이스크림
  {
    name: '메로나',
    category: '아이스크림',
    price: 1000,
    stock: 80,
    status: 'published',
    badge: 'HOT',
    isActive: true,
  },
  {
    name: '하겐다즈 바닐라 미니컵',
    category: '아이스크림',
    price: 3000,
    stock: 50,
    status: 'published',
    originalPrice: 3500,
    isActive: true,
  },
  {
    name: '수박바',
    category: '아이스크림',
    price: 800,
    stock: 70,
    status: 'published',
    badge: 'NEW',
    isActive: true,
  },
  {
    name: '돼지바',
    category: '아이스크림',
    price: 900,
    stock: 65,
    status: 'published',
    isActive: true,
  },
  {
    name: '빵빠레',
    category: '아이스크림',
    price: 1000,
    stock: 75,
    status: 'published',
    isActive: true,
  },

  // 생활용품
  {
    name: '크리넥스 미용티슈 250매',
    category: '생활용품',
    price: 2000,
    stock: 100,
    status: 'published',
    isActive: true,
  },
  {
    name: '깨끗한나라 물티슈 80매',
    category: '생활용품',
    price: 2500,
    stock: 90,
    status: 'published',
    badge: 'NEW',
    isActive: true,
  },
  {
    name: 'CJ 비닐봉투 중형 100매',
    category: '생활용품',
    price: 1500,
    stock: 120,
    status: 'published',
    isActive: true,
  },
  {
    name: '락앤락 밀폐용기 500ml',
    category: '생활용품',
    price: 3000,
    stock: 60,
    status: 'published',
    originalPrice: 4000,
    isActive: true,
  },
  {
    name: '3M 설거지 스펀지 3입',
    category: '생활용품',
    price: 2000,
    stock: 80,
    status: 'published',
    isActive: true,
  },

  // 유제품
  {
    name: '서울우유 200ml',
    category: '유제품',
    price: 1200,
    stock: 150,
    status: 'published',
    badge: 'HOT',
    isActive: true,
  },
  {
    name: '요플레 딸기맛 85g',
    category: '유제품',
    price: 800,
    stock: 100,
    status: 'published',
    isActive: true,
  },
  {
    name: '덴마크 치즈 3P',
    category: '유제품',
    price: 2000,
    stock: 70,
    status: 'published',
    isActive: true,
  },
  {
    name: '불가리스 150ml',
    category: '유제품',
    price: 1000,
    stock: 120,
    status: 'published',
    badge: 'NEW',
    isActive: true,
  },
  {
    name: '매일 상하목장 우유 500ml',
    category: '유제품',
    price: 2500,
    stock: 80,
    status: 'published',
    originalPrice: 3000,
    isActive: true,
  },
]

async function createProduct(product: CreateProductPayload) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/admin/products`,
      product,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    console.log(`✅ 상품 생성 성공: ${product.name}`)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`❌ 상품 생성 실패: ${product.name}`)
      console.error(`   에러: ${error.response?.data?.message || error.message}`)
    } else {
      console.error(`❌ 알 수 없는 에러: ${product.name}`, error)
    }
    throw error
  }
}

async function seedProducts() {
  console.log('🌱 더미 상품 데이터 생성 시작...\n')
  console.log(`📍 API 서버: ${API_BASE_URL}\n`)

  let successCount = 0
  let failCount = 0

  for (const product of DUMMY_PRODUCTS) {
    try {
      await createProduct(product)
      successCount++
      // 서버 부하 방지를 위한 딜레이
      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (error) {
      failCount++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`\n✨ 완료!`)
  console.log(`   성공: ${successCount}개`)
  console.log(`   실패: ${failCount}개`)
  console.log(`   전체: ${DUMMY_PRODUCTS.length}개\n`)
}

// 스크립트 실행
seedProducts().catch(error => {
  console.error('\n💥 스크립트 실행 중 오류 발생:', error)
  process.exit(1)
})
