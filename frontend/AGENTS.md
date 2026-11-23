# Upsolve.it Frontend - Agent Guide

## Essential Commands
- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run lint` - Run ESLint
- No test command configured (no test scripts in package.json)

## Key Directories
- `app/` - Next.js App Router (pages, layouts, route groups)
- `components/` - Reusable UI components
- `components/ui/` - Radix/Shadcn primitives
- `app/_Components/` - Page-specific components
- `hooks/` - Custom React hooks (SWR, auth, etc.)
- `services/` - API service functions
- `lib/` - Utilities and helpers
- `types/` - TypeScript type definitions
- `public/` - Static assets

## Framework & Toolchain
- Next.js 16.2.4 (App Router)
- React 19
- Tailwind CSS + Custom CSS variables
- TypeScript 5
- Framer Motion for animations
- SWR for data fetching
- Lucide React for icons
- Radix UI + Shadcn/ui for accessible components

## Important Conventions
1. **Next.js App Router**: 
   - Files in `app/` define routes
   - `page.tsx` = route UI (server component by default)
   - `layout.tsx` = route layout
   - `loading.tsx` = suspense boundary
   - Use `"use client"` for client components

2. **Metadata**: 
   - Must be exported from server components only
   - For interactive pages needing client state, use server/client split:
     - `page.tsx` (server): exports metadata + renders client component
     - `page.client.tsx` (client): contains interactive UI

3. **Styling**:
   - Tailwind CSS with custom color palette (emerald primary)
   - CSS variables in `globals.css`
   - Component variants via `cn()` utility from `@/lib/utils`

4. **Data Fetching**:
   - Server: Direct `fetch()` or API calls in server components
   - Client: SWR hooks (`useUser`, `useHistory`, etc.)
   - Auth: JWT stored in cookies, validated server-side

5. **Component Organization**:
   - Feature colocation: `app/feature/_Components/`
   - Shared primitives: `components/ui/`
   - Layout components: `components/layout/`

## Environment
- Requires `.env.local` with `NEXT_PUBLIC_API_BASE_URL`
- Default API base points to localhost:5000 (backend service)
- No build-time env vars needed beyond Next.js standards

## Gotchas
- Next.js 16: `params` in `generateStaticParams` or `page` is a Promise - use `await params`
- Framer Motion animations require client components
- `metadata` export prevents `"use client"` in same file
- Admin routes have special auth requirements
- Image optimization requires remotePatterns in next.config.js for Codeforces avatars