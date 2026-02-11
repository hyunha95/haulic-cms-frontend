# Repository Guidelines

## Project Structure & Module Organization
- `app/` contains Next.js App Router routes. Most routes are thin wrappers that compose `AdminLayout` with a feature component.
- `components/` holds feature and layout components (for example `admin-layout.tsx`, `products-manage.tsx`).
- `components/ui/` stores shadcn/ui primitives; treat these as generated building blocks.
- `lib/` contains shared types, mock data, and browser-storage helpers.
- `hooks/` contains reusable React hooks, and `public/` stores static assets.

## Build, Test, and Development Commands
- `pnpm install`: install dependencies.
- `pnpm dev`: run local development server with Turbopack.
- `pnpm build`: create a production build.
- `pnpm start`: serve the production build.
- `pnpm lint`: run Next.js ESLint checks (required before PR).

## Coding Style & Naming Conventions
- Use TypeScript and React function components.
- Follow existing formatting: 2-space indentation and avoid unnecessary reformat-only diffs.
- Use the `@/*` path alias (configured in `tsconfig.json`) for cross-folder imports.
- Keep route entry files as `app/**/page.tsx`.
- Use kebab-case filenames for components (for example `product-categories-manage.tsx`) and PascalCase for exported component names.
- Keep shared domain types in `lib/types.ts`.

## Testing Guidelines
- No automated test runner is currently configured (`package.json` has no `test` script).
- Current baseline is `pnpm lint` plus manual route checks for changed screens.
- When introducing tests, prefer colocated `*.test.ts` or `*.test.tsx` files near the module under test.

## Commit & Pull Request Guidelines
- Current history is minimal (single commit: `first commit`), so conventions are still being established.
- Use concise, imperative commit subjects with a scope prefix, e.g. `products: add category tree persistence`.
- PRs should include:
  - a short summary of behavior changes,
  - impacted routes/components,
  - screenshots for UI updates,
  - verification notes (`pnpm lint`, manual paths tested).

## Configuration & Data Notes
- This CMS currently uses mock/local data (`lib/mock-data.ts`, `lib/*-storage.ts`), not a live backend.
- Never commit secrets; `.env*.local` is ignored.
