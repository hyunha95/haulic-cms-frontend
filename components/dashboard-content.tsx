"use client"

import {
  Package,
  Star,
  ShoppingCart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { dashboardStats, recentActivity } from "@/lib/mock-data"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

const weeklyData = [
  { name: "월", orders: 420, revenue: 4200000 },
  { name: "화", orders: 380, revenue: 3800000 },
  { name: "수", orders: 510, revenue: 5100000 },
  { name: "목", orders: 340, revenue: 3400000 },
  { name: "금", orders: 490, revenue: 4900000 },
  { name: "토", orders: 620, revenue: 6200000 },
  { name: "일", orders: 550, revenue: 5500000 },
]

const monthlyTrend = [
  { month: "9월", revenue: 18500000 },
  { month: "10월", revenue: 21200000 },
  { month: "11월", revenue: 24800000 },
  { month: "12월", revenue: 28100000 },
  { month: "1월", revenue: 22300000 },
  { month: "2월", revenue: 23450000 },
]

function formatKRW(value: number) {
  if (value >= 100000000) return `${(value / 100000000).toFixed(1)}억원`
  if (value >= 10000) return `${(value / 10000).toFixed(0)}만원`
  return `${value.toLocaleString()}원`
}

const statCards = [
  {
    title: "총 상품 수",
    value: dashboardStats.totalProducts.toLocaleString(),
    sub: `활성: ${dashboardStats.activeProducts.toLocaleString()}`,
    icon: Package,
    trend: "+12",
    trendUp: true,
  },
  {
    title: "총 리뷰",
    value: dashboardStats.totalReviews.toLocaleString(),
    sub: `대기: ${dashboardStats.pendingReviews}건`,
    icon: Star,
    trend: "+8",
    trendUp: true,
  },
  {
    title: "오늘 주문",
    value: dashboardStats.todayOrders.toLocaleString(),
    sub: `누적: ${dashboardStats.totalOrders.toLocaleString()}`,
    icon: ShoppingCart,
    trend: "-3",
    trendUp: false,
  },
  {
    title: "월 매출",
    value: formatKRW(dashboardStats.monthlyRevenue),
    sub: `누적: ${formatKRW(dashboardStats.totalRevenue)}`,
    icon: TrendingUp,
    trend: "+15",
    trendUp: true,
  },
]

export function DashboardContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">대시보드</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {"천원마켓 CMS 관리 현황을 확인하세요."}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">{stat.sub}</p>
                <span
                  className={`flex items-center text-xs font-medium ${
                    stat.trendUp ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {stat.trendUp ? (
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  )}
                  {stat.trend}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">주간 주문 현황</CardTitle>
            <CardDescription>최근 7일 간 주문 건수</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value}건`, "주문수"]}
                />
                <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">월별 매출 추이</CardTitle>
            <CardDescription>최근 6개월</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v) => formatKRW(v)}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [formatKRW(value), "매출"]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">최근 활동</CardTitle>
          <CardDescription>관리자 작업 내역</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.target}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="outline" className="text-xs font-normal">
                    {activity.user}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
