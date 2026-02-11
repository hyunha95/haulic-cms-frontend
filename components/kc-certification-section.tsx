"use client"

import { useId, useRef, useState } from "react"
import { ChevronDown, CircleHelp, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type KcStatus = "HAS" | "NONE"
type NoneReason = "PURCHASE_AGENCY" | "SAFETY_COMPLIANCE" | "NOT_TARGET"

type CertificationInfoRow = {
  id: number
  category: string
}

const KC_DUMMY_OPTIONS = ["KC", "전기용품", "생활용품", "어린이제품", "방송통신기자재"]

function KcSelectField({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string
  onChange: (value: string) => void
  options: string[]
  ariaLabel: string
}) {
  return (
    <div className="relative">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-11 w-full appearance-none rounded-md border border-input bg-background px-3 pr-10 text-sm shadow-sm outline-none transition",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          value ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <option value="" disabled>
          선택
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    </div>
  )
}

function KcDisabledTextInput({ placeholder, ariaLabel }: { placeholder: string; ariaLabel: string }) {
  return (
    <input
      type="text"
      disabled
      aria-label={ariaLabel}
      placeholder={placeholder}
      className="h-11 w-full rounded-md border border-input bg-muted/70 px-3 text-sm text-muted-foreground placeholder:text-muted-foreground"
    />
  )
}

function KcNotice() {
  return (
    <div className="space-y-1 text-sm leading-6 text-emerald-600">
      <p>KC인증이 필요한 상품을 인증 없이 판매하는 경우 3년 이하의 징역 또는 3천만원 이하의 벌금형에 처해질 수 있습니다.</p>
      <p>
        인증대상 여부 문의는 국가기술표준원 또는 제품안전정보센터로 확인해주시기 바랍니다.
        <span className="ml-1 font-medium underline underline-offset-2">개정 전안법가이드북 보기 {" >"}</span>
      </p>
      <p>어린이제품 및 방송통신기자재는 개정 전안법 특례대상이 아니므로 구매대행 / 병행수입을 선택할 수 없습니다.</p>
    </div>
  )
}

type KcCertificationSectionProps = {
  className?: string
}

export function KcCertificationSection({ className }: KcCertificationSectionProps) {
  const baseId = useId()
  const nextRowId = useRef(2)

  const [kcStatus, setKcStatus] = useState<KcStatus>("HAS")
  const [selectedMainOption, setSelectedMainOption] = useState("")
  const [purchaseAgency, setPurchaseAgency] = useState(false)
  const [parallelImport, setParallelImport] = useState(false)
  const [noneReason, setNoneReason] = useState<NoneReason>("NOT_TARGET")
  const [infoRows, setInfoRows] = useState<CertificationInfoRow[]>([{ id: 1, category: "" }])

  const addInfoRow = () => {
    setInfoRows((prev) => [...prev, { id: nextRowId.current++, category: "" }])
  }

  const updateInfoRow = (id: number, category: string) => {
    setInfoRows((prev) => prev.map((row) => (row.id === id ? { ...row, category } : row)))
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-foreground">KC인증</CardTitle>
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary">
              <CircleHelp className="h-3.5 w-3.5" />
            </span>
          </div>
          <CardDescription>KC 인증 관련 정보를 입력하고 관리하세요.</CardDescription>
        </div>

        <div role="tablist" aria-label="KC인증 상태" className="inline-flex overflow-hidden rounded-md border border-input bg-muted/30 p-0.5">
          {([
            { value: "HAS", label: "KC인증 있음" },
            { value: "NONE", label: "KC인증 없음" },
          ] as const).map((tab) => {
            const selected = kcStatus === tab.value
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setKcStatus(tab.value)}
                className={cn(
                  "h-10 min-w-[136px] rounded-sm px-4 text-sm font-medium transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  selected ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-background"
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </CardHeader>

      <CardContent className="space-y-0 pt-0">
        <div className="grid grid-cols-1 gap-4 border-t border-border py-6 md:grid-cols-[140px_minmax(0,1fr)] md:gap-6">
          <div className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
            <span>인증선택</span>
            <span aria-hidden="true" className="text-base leading-none text-destructive">
              •
            </span>
          </div>

          <div className="space-y-4">
            {kcStatus === "HAS" ? (
              <>
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                  <KcSelectField value={selectedMainOption} onChange={setSelectedMainOption} options={KC_DUMMY_OPTIONS} ariaLabel="인증선택 분류" />
                  <KcDisabledTextInput placeholder="인증기관" ariaLabel="인증기관" />
                  <KcDisabledTextInput placeholder="인증번호" ariaLabel="인증번호" />
                </div>

                <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                  <label htmlFor={`${baseId}-purchaseAgency`} className="inline-flex items-center gap-2 text-sm text-foreground">
                    <input
                      id={`${baseId}-purchaseAgency`}
                      type="checkbox"
                      checked={purchaseAgency}
                      onChange={(e) => setPurchaseAgency(e.target.checked)}
                      className="h-4 w-4 rounded border-input accent-primary"
                    />
                    구매대행
                  </label>

                  <label htmlFor={`${baseId}-parallelImport`} className="inline-flex items-center gap-2 text-sm text-foreground">
                    <input
                      id={`${baseId}-parallelImport`}
                      type="checkbox"
                      checked={parallelImport}
                      onChange={(e) => setParallelImport(e.target.checked)}
                      className="h-4 w-4 rounded border-input accent-primary"
                    />
                    병행수입
                  </label>
                </div>
              </>
            ) : (
              <fieldset className="flex flex-wrap items-center gap-x-8 gap-y-3">
                <legend className="sr-only">KC인증 없음 사유</legend>

                <label className="inline-flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="radio"
                    name={`${baseId}-noneReason`}
                    checked={noneReason === "PURCHASE_AGENCY"}
                    onChange={() => setNoneReason("PURCHASE_AGENCY")}
                    className="h-4 w-4 border-input accent-primary"
                  />
                  구매대행
                </label>

                <label className="inline-flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="radio"
                    name={`${baseId}-noneReason`}
                    checked={noneReason === "SAFETY_COMPLIANCE"}
                    onChange={() => setNoneReason("SAFETY_COMPLIANCE")}
                    className="h-4 w-4 border-input accent-primary"
                  />
                  안전기준 준수
                </label>

                <label className="inline-flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="radio"
                    name={`${baseId}-noneReason`}
                    checked={noneReason === "NOT_TARGET"}
                    onChange={() => setNoneReason("NOT_TARGET")}
                    className="h-4 w-4 border-input accent-primary"
                  />
                  KC 안전관리대상 아님
                </label>
              </fieldset>
            )}

            <KcNotice />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-border py-6 md:grid-cols-[140px_minmax(0,1fr)] md:gap-6">
          <div className="flex items-center text-sm font-semibold text-muted-foreground">인증정보</div>

          <div className="space-y-3">
            {infoRows.map((row) => (
              <div key={row.id} className="grid grid-cols-1 gap-3 lg:grid-cols-[220px_minmax(0,1fr)_minmax(0,1fr)_44px]">
                <KcSelectField
                  value={row.category}
                  onChange={(value) => updateInfoRow(row.id, value)}
                  options={KC_DUMMY_OPTIONS}
                  ariaLabel={`인증정보 선택 ${row.id}`}
                />
                <KcDisabledTextInput placeholder="인증기관" ariaLabel={`인증기관 ${row.id}`} />
                <KcDisabledTextInput placeholder="인증번호" ariaLabel={`인증번호 ${row.id}`} />
                <button
                  type="button"
                  onClick={addInfoRow}
                  aria-label="인증정보 행 추가"
                  className={cn(
                    "inline-flex h-11 w-11 items-center justify-center rounded-md bg-foreground text-background transition",
                    "hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  )}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
