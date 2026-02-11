import React from "react"
import type { Metadata } from 'next'
import { Noto_Sans_KR } from 'next/font/google'

import './globals.css'

const notoSansKR = Noto_Sans_KR({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: '천원마켓 CMS',
  description: '천원마켓 관리자 대시보드',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKR.className} antialiased`}>{children}</body>
    </html>
  )
}
