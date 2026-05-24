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
- Schema: `supabase/migrations/00001_initial_schema.sql`
- Tables: groups, group_members, photos, photo_comments
- RLS: group-scoped access (members/admins only)

## Conventions
- `params` and `searchParams` are Promises — always `await`
- `cookies()` and `headers()` are async — always `await`
- Types in `src/types/`
- Supabase lib in `src/lib/supabase/`
- Components in `src/components/`
- Run `npm run build` to verify before committing
