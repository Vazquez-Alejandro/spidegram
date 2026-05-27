<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Spidegram — Project Context

## Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Supabase (auth, Postgres, storage, RLS)
- `proxy.ts` replaces `middleware.ts` (Next.js 16 breaking change)

## Auth
- Supabase SSR: `createBrowserClient` (client), `createServerClient` (server/proxy)
- Server Actions in `src/lib/supabase/actions.ts` for sign-up, sign-in, sign-out
- Proxy at `src/proxy.ts` handles session cookie refresh
- Auth callback at `/auth/callback`

## Database
- Schema: `supabase/migrations/00001_initial_schema.sql` through `00010_admin.sql`
- Tables: groups, group_members, photos, photo_comments, friendships, reactions, profiles, albums, stories, story_views, reports, super_admins
- RLS: group-scoped access (members/admins only), friendships, reactions, public photo comments, stories (group-scoped + 24h expiry), reports (admin-only)

## Conventions
- `params` and `searchParams` are Promises — always `await`
- `cookies()` and `headers()` are async — always `await`
- Types in `src/types/`
- Supabase lib in `src/lib/supabase/`
- Group actions in `src/lib/supabase/groups.ts`
- Components in `src/components/`
- Run `npm run build` to verify before committing

## Testing
- Unit tests: `npm test` (vitest). Tests in `src/__tests__/`
- E2E tests: `npm run test:e2e` (Playwright). Tests in `e2e/`
- Mock `next/navigation` and `next/cache` for Server Action tests
- Use `createClient` mock from `@/lib/supabase/server` for DB tests
- Run `npm test` before committing

## Progress — MVP v0.1

- [x] Auth completo — registro, login, logout
- [x] Schema inicial + migraciones
- [x] Crear grupos — formulario + Server Action
- [x] Unirse a grupos — por ID
- [x] Dashboard de usuario — lista de grupos
- [x] Página de detalle de grupo — miembros, foto grilla
- [x] Social features schema — friendships, reactions, profiles
- [x] Subir fotos — formulario upload + Server Action + Supabase Storage
- [x] Aprobar/rechazar — panel de admin en grupo
- [x] Comentar fotos — formulario + listado en foto individual
- [x] Dashboard de grupo — upload, pendientes (admin), grilla aprobadas
- [x] Feed social — fotos públicas de amigos
- [x] Seguir/amigos — UI de friendships + búsqueda
- [x] Notificaciones — schema + triggers + página + badge en navbar
- [x] Álbumes — schema, CRUD, upload filter, grid filter, group tabs
- [x] Descarga de fotos — botón en detalle + overlay en grilla
- [x] Búsqueda global — /search con resultados de fotos, grupos, personas
- [x] Analytics de grupo — stats cards + leaderboard (admin)
- [x] Modo claro/oscuro — ThemeToggle con persistencia localStorage
- [x] Stories (Instagram) — upload, viewer full-screen, rings en grupo
- [x] Avatar uploads — bucket + Avatar component + navbar/profile
- [x] Comentarios en tiempo real — Realtime subscription
- [x] Moderación — reportar fotos + admin panel de reports
- [x] Admin dashboard — stats globales para super-admins
- [x] PWA — manifest + service worker
- [x] SEO — metadata, sitemap, robots.txt
- [x] Error/loading boundaries — 11 rutas con error + loading states
- [x] CI/CD — GitHub Actions (lint → build → test)
- [x] Tests — 13 unit tests, 3 E2E tests
