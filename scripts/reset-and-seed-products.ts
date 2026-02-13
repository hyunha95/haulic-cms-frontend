/**
 * 상품 초기화 및 이미지 포함 더미 데이터 생성 스크립트
 *
 * 기능:
 * 1. 모든 기존 상품 삭제
 * 2. 100개의 새로운 상품 생성 (이미지 포함)
 *
 * 실행 방법:
 * pnpm tsx scripts/reset-and-seed-products.ts
 */

import axios from 'axios'
import * as fs from 'fs'
import * as path from 'path'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:18080'

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  status: string
  [key: string]: unknown
}

interface CreateProductPayload {
  name: string
  category: string
  price: number
  stock: number
  status: 'draft' | 'published' | 'scheduled'
  badge?: 'NEW' | 'HOT'
  image?: string
  additionalImages?: string[]
  detailDescriptionImage?: string
  originalPrice?: number
  isActive: boolean
}

interface PresignResponse {
  uploadUrl: string
  fileUrl: string
  objectKey: string
  expiresInSeconds: number
}

// ============================================
// 1. 모든 상품 삭제
// ============================================

async function getAllProducts(): Promise<Product[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/products`, {
      params: {
        page: 0,
        size: 1000, // 한번에 많이 가져오기
      },
    })
    return response.data.content || []
  } catch (error) {
    console.error('상품 목록 조회 실패:', error)
    return []
  }
}

async function deleteAllProducts() {
  console.log('🗑️  기존 상품 삭제 중...\n')

  const products = await getAllProducts()

  if (products.length === 0) {
    console.log('삭제할 상품이 없습니다.\n')
    return
  }

  console.log(`총 ${products.length}개의 상품을 삭제합니다.\n`)

  // 벌크 삭제 API 사용
  const productIds = products.map(p => p.id)

  try {
    await axios.delete(`${API_BASE_URL}/api/admin/products`, {
      params: {
        ids: productIds.join(','),
      },
    })
    console.log(`✅ ${productIds.length}개 상품 삭제 완료!\n`)
  } catch (error) {
    console.error('벌크 삭제 실패, 개별 삭제 시도...\n')

    // 벌크 삭제 실패시 개별 삭제
    for (const product of products) {
      try {
        await axios.delete(`${API_BASE_URL}/api/admin/products/${product.id}`)
        console.log(`✅ 삭제: ${product.name}`)
      } catch (err) {
        console.error(`❌ 삭제 실패: ${product.name}`)
      }
    }
  }
}

// ============================================
// 2. 이미지 생성 및 업로드
// ============================================

/**
 * 간단한 컬러 이미지를 Canvas로 생성 (Node.js에서는 Buffer로 생성)
 */
function createColorImageBuffer(color: string, width: number = 400, height: number = 400): Buffer {
  // SVG를 사용하여 간단한 컬러 이미지 생성
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${color}"/>
      <text x="50%" y="50%" font-size="24" fill="white" text-anchor="middle" dy=".3em">Product Image</text>
    </svg>
  `
  return Buffer.from(svg)
}

/**
 * Lorem Picsum에서 이미지 다운로드
 */
async function downloadPlaceholderImage(seed: number): Promise<Buffer> {
  try {
    const response = await axios.get(`https://picsum.photos/seed/${seed}/400/400`, {
      responseType: 'arraybuffer',
    })
    return Buffer.from(response.data)
  } catch (error) {
    console.error('이미지 다운로드 실패, 컬러 이미지로 대체합니다.')
    // 실패시 랜덤 컬러 이미지 생성
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2']
    const color = colors[seed % colors.length]
    return createColorImageBuffer(color)
  }
}

/**
 * Presigned URL 발급 및 이미지 업로드
 */
async function uploadImage(
  imageBuffer: Buffer,
  fileName: string,
  purpose: 'product_main' | 'product_additional' | 'product_detail' = 'product_main'
): Promise<string> {
  try {
    // 1. Presigned URL 발급
    const presignResponse = await axios.post<PresignResponse>(
      `${API_BASE_URL}/api/admin/uploads/presign`,
      {
        fileName,
        contentType: 'image/jpeg',
        purpose,
      }
    )

    const { uploadUrl, fileUrl } = presignResponse.data

    // 2. 이미지 업로드
    await axios.put(uploadUrl, imageBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    })

    return fileUrl
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('업로드 에러:', error.response?.data || error.message)
    }
    throw error
  }
}

// ============================================
// 3. 상품 데이터 생성
// ============================================

const CATEGORIES = [
  '스낵/과자',
  '음료',
  '라면/즉석식품',
  '초콜릿/캔디',
  '아이스크림',
  '생활용품',
  '유제품',
  '과일/채소',
  '정육/계란',
  '수산물/건어물',
  '쌀/잡곡',
  '냉동식품',
  '베이커리/잼',
  '조미료/오일',
  '통조림/가공식품',
]

const PRODUCT_NAMES = [
  // 스낵/과자
  '허니버터칩', '새우깡', '포카칩', '오감자', '치토스', '프링글스', '썬칩', '콘칩', '맛동산', '꼬북칩',
  // 음료
  '코카콜라', '사이다', '포카리스웨트', '게토레이', '비타500', '밀키스', '데미소다', '환타', '펩시', '마운틴듀',
  // 라면
  '신라면', '진라면', '불닭볶음면', '짜파게티', '너구리', '안성탕면', '육개장', '김치라면', '비빔면', '쫄면',
  // 초콜릿/캔디
  '빼빼로', '칸초', '가나초콜릿', '쌀롱카', '마이쮸', 'ABC초콜릿', '다이제', '오레오', '초코파이', '찰떡파이',
  // 아이스크림
  '메로나', '하겐다즈', '수박바', '돼지바', '빵빠레', '죠스바', '엄마손파이', '누가바', '월드콘', '슈퍼콘',
  // 생활용품
  '티슈', '물티슈', '비닐봉투', '밀폐용기', '스펀지', '주방세제', '섬유유연제', '세탁세제', '칫솔', '치약',
  // 유제품
  '우유', '요거트', '치즈', '버터', '생크림', '요플레', '불가리스', '떠먹는요거트', '그릭요거트', '두유',
  // 과일/채소
  '사과', '배', '딸기', '포도', '수박', '토마토', '오이', '당근', '양파', '감자',
  // 정육/계란
  '계란', '삼겹살', '목살', '닭가슴살', '소고기', '돼지고기', '닭다리', '베이컨', '소시지', '햄',
  // 수산물
  '고등어', '갈치', '명태', '오징어', '새우', '조기', '광어', '연어', '참치캔', '김',
  // 쌀/잡곡
  '쌀', '현미', '찹쌀', '보리', '귀리', '퀴노아', '흑미', '율무', '팥', '녹두',
  // 냉동식품
  '냉동만두', '냉동피자', '치킨너겟', '냉동볶음밥', '냉동감자튀김', '냉동새우', '냉동야채', '냉동햄버거패티', '냉동생선', '냉동고로케',
]

const ADJECTIVES = ['프리미엄', '특선', '신선한', '유기농', '국내산', '무농약', '저당', '무첨가', '천연', '건강한']

function generateProductName(index: number): string {
  const baseName = PRODUCT_NAMES[index % PRODUCT_NAMES.length]
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const size = ['100g', '200g', '500g', '1kg', '300ml', '500ml', '1L', '2L', '1개', '5개입'][Math.floor(Math.random() * 10)]

  if (Math.random() > 0.5) {
    return `${adjective} ${baseName} ${size}`
  }
  return `${baseName} ${size}`
}

function generateProduct(index: number): Omit<CreateProductPayload, 'image' | 'additionalImages' | 'detailDescriptionImage'> {
  const category = CATEGORIES[index % CATEGORIES.length]
  const basePrice = Math.floor(Math.random() * 19 + 1) * 1000 // 1000~20000원
  const hasDiscount = Math.random() > 0.7
  const badge = Math.random() > 0.7 ? (Math.random() > 0.5 ? 'NEW' : 'HOT') : undefined

  return {
    name: generateProductName(index),
    category,
    price: basePrice,
    stock: Math.floor(Math.random() * 200) + 50,
    status: 'published',
    badge,
    originalPrice: hasDiscount ? basePrice + Math.floor(Math.random() * 5 + 1) * 1000 : undefined,
    isActive: true,
  }
}

// ============================================
// 4. 상품 생성 (이미지 포함)
// ============================================

async function createProductWithImages(productData: Omit<CreateProductPayload, 'image' | 'additionalImages' | 'detailDescriptionImage'>, seed: number) {
  try {
    console.log(`📦 생성 중: ${productData.name}`)

    // 1. 메인 이미지 업로드
    console.log('   ⬆️  메인 이미지 업로드 중...')
    const mainImageBuffer = await downloadPlaceholderImage(seed)
    const mainImageUrl = await uploadImage(mainImageBuffer, `product-${seed}-main.jpg`, 'product_main')

    // 2. 추가 이미지 업로드 (1~3개 랜덤)
    const additionalCount = Math.floor(Math.random() * 3) + 1
    const additionalImageUrls: string[] = []

    for (let i = 0; i < additionalCount; i++) {
      console.log(`   ⬆️  추가 이미지 ${i + 1} 업로드 중...`)
      const additionalBuffer = await downloadPlaceholderImage(seed * 10 + i)
      const additionalUrl = await uploadImage(additionalBuffer, `product-${seed}-additional-${i}.jpg`, 'product_additional')
      additionalImageUrls.push(additionalUrl)
    }

    // 3. 상세 이미지 업로드 (50% 확률)
    let detailImageUrl: string | undefined
    if (Math.random() > 0.5) {
      console.log('   ⬆️  상세 이미지 업로드 중...')
      const detailBuffer = await downloadPlaceholderImage(seed * 100)
      detailImageUrl = await uploadImage(detailBuffer, `product-${seed}-detail.jpg`, 'product_detail')
    }

    // 4. 상품 생성
    const payload: CreateProductPayload = {
      ...productData,
      image: mainImageUrl,
      additionalImages: additionalImageUrls,
      detailDescriptionImage: detailImageUrl,
    }

    const response = await axios.post(
      `${API_BASE_URL}/api/admin/products`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    console.log(`   ✅ 생성 완료!\n`)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`   ❌ 실패: ${error.response?.data?.message || error.message}\n`)
    } else {
      console.error(`   ❌ 알 수 없는 에러\n`, error)
    }
    throw error
  }
}

// ============================================
// 메인 실행
// ============================================

async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('🚀 상품 데이터 초기화 및 재생성')
  console.log('='.repeat(60) + '\n')
  console.log(`📍 API 서버: ${API_BASE_URL}`)
  console.log(`📊 생성할 상품 수: 100개\n`)

  // 1단계: 모든 상품 삭제
  await deleteAllProducts()

  // 2단계: 100개의 상품 생성
  console.log('📦 새로운 상품 생성 시작...\n')

  let successCount = 0
  let failCount = 0

  for (let i = 0; i < 100; i++) {
    try {
      const productData = generateProduct(i)
      await createProductWithImages(productData, i + 1)
      successCount++

      // 서버 부하 방지
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      failCount++
    }
  }

  // 완료 메시지
  console.log('\n' + '='.repeat(60))
  console.log('✨ 완료!')
  console.log('='.repeat(60))
  console.log(`✅ 성공: ${successCount}개`)
  console.log(`❌ 실패: ${failCount}개`)
  console.log(`📊 전체: 100개`)
  console.log('='.repeat(60) + '\n')
}

// 스크립트 실행
main().catch(error => {
  console.error('\n💥 스크립트 실행 중 치명적 오류 발생:', error)
  process.exit(1)
})
