# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

천원마켓 (1000 Won Market) CMS — an admin dashboard for managing an e-commerce storefront. Built with Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 3, and shadcn/ui components. The UI language is Korean.

## Commands

- `pnpm dev` — Start dev server with Turbopack
- `pnpm build` — Production build (note: `ignoreBuildErrors: true` is set in next.config.mjs)
- `pnpm lint` — Run Next.js ESLint

## Architecture

**Routing (App Router):** Pages live in `app/` and are thin wrappers that compose `AdminLayout` with a content component:
- `/` — Dashboard (`DashboardContent`)
- `/products` — Product management (`ProductsManage`)
- `/exhibitions` — Exhibition management (`ExhibitionsManage`)
- `/home-manage/hero` — Hero banner management (`HeroManage`)

Each page follows the same pattern: import `AdminLayout` + a `*-manage` component.

**Layout:** `AdminLayout` wraps every page and provides the sidebar (`AdminSidebar`) + header (`AdminHeader`) via shadcn's `SidebarProvider`/`SidebarInset`. All layout components are client components (`"use client"`).

**Components:**
- `components/ui/` — shadcn/ui primitives (do not hand-edit; managed via `npx shadcn@latest add`)
- `components/*-manage.tsx` — Page-level feature components (hero, products, exhibitions, reviews, navigation, shortcuts, promo, ranking)
- `components/admin-layout.tsx`, `admin-sidebar.tsx`, `admin-header.tsx` — Shell/chrome components

**Data layer:** Currently uses mock data only — all data comes from `lib/mock-data.ts` with types defined in `lib/types.ts`. There is no backend/API/database yet. State is managed locally with `useState` in each manage component.

**Styling:** Tailwind CSS with CSS custom properties for theming (`hsl(var(--...))` pattern). Dark mode is configured via class strategy. Global CSS in `app/globals.css`. Icons from `lucide-react`.

## Key Conventions

- Path alias: `@/*` maps to the project root
- Package manager: pnpm
- Font: Noto Sans KR (loaded via `next/font/google`)
- shadcn/ui config: `components.json` — style "default", RSC enabled, base color "neutral", icon library "lucide"
- All types extend `BaseEntity` (id, timestamps, createdBy/updatedBy, status) defined in `lib/types.ts`
- `PublishStatus` uses three states: `"draft" | "published" | "scheduled"`
- Currency is KRW (원). Prices are stored as numbers in won.
