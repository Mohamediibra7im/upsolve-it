# Upsolve It | Interface Cockpit

> **Frontend Protocol: COMMAND-CONSOLE-V3**
> A high-fidelity, monospaced dark terminal dashboard for elite competitive programmers.
>
> 📡 **Backend Core Service**: [upsolve-it--backend](https://github.com/Mohamediibra7im/upsolve-it--backend)

---

## Design: "Track"

The interface is dark and loud where it counts: a near-black ground, condensed uppercase headlines, sharp corners, and one volt action per view.

- **One top bar** on public pages, the app and the admin. No sidebar.
- **Wide frame**: content sits in a 1440px container.
- **Lines, not shadows**: panels are a surface with a hairline; shadows only for things that float.
- **Numbers in mono**: every rating, problem id, duration and clock.
- **Colour never stands alone**: solved, failed and pending always come with a word and an icon.
- Tokens and component classes live in `app/globals.css`; shared pieces in `components/ui/kit.tsx`.

---

## 🛠️ Technical Stack

- **Framework**: Next.js 16+ (App Router)
- **Engine**: Turbopack compiler
- **Styling**: Vanilla Tailwind CSS + Custom theme variables
- **Components**: Radix UI + Custom shadcn primitives
- **Data Hydration**: SWR (Stale-While-Revalidate)
- **Icons**: Lucide React
- **Testing**: Jest + React Testing Library

---

## 📡 Launch Protocols

### 1. Configure Environment variables
Create `.env.local` inside `frontend--upsolve-it`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

### 2. Install & Start Server
```bash
npm install --legacy-peer-deps
npm run dev
```

---

## 📋 Available Operations Scripts

| Command | Action |
|---------|--------|
| `npm run dev` | Launch the development server |
| `npm run build` | Compile static production optimized files |
| `npm run lint` | Run ESLint check for JSX validations |
| `npm test` | Run frontend test suites |

### Profile photos

Codeforces avatars use `/api/profile-image`, which accepts only public image paths on `userpic.codeforces.org`, validates image bytes, and caches successful photos for 24 hours with stale delivery during revalidation. Failed downloads are not cached. Avatars show initials during failures and retry twice; unavailable upstream photos cannot be recreated.

### Local dependency security backport

`vendor/braces` is an MIT-licensed local backport of braces 3.0.3 with bounded nesting and AST cycle checks. It is installed as an explicit local dependency and override; `.npmrc` packs local dependencies so CI installs their dependencies correctly. `npm run test:dependencies` checks the actual chokidar and micromatch consumers. Replace this backport only after verifying an upstream fix against those tests. CI and deployment audit development dependencies as well as production dependencies.

### Test dependency compatibility

Tests use the SWC transformer supplied by `next/jest`. The test dependency overrides use jsdom 27.4 and test-exclude 8 to replace deprecated encoding and glob packages. Use Node 22.12 or newer; CI runs Node 22.

The coverage configuration loader uses the compatible `js-yaml` 4 `load()` API, and brace-expansion 1 is pinned to its patched release. Native install-script approvals are limited to the reviewed versions in `allowScripts`; review a new version before approving its installer with npm 12's `npm install-scripts approve <package>`.

---

## 📂 Project Architecture

### 1. App Routes (`app/`)
- **`app/(auth)/`** - Borderless, centered auth layouts (login, register, reset-password).
- **`app/(main)/`** - Core dashboard, roadmap logs, user statistics.
- **`app/(marketing)/`** - Landing showcase page and documentation guides.
- **`app/admin/`** - Admin panel sidebar control cockpit.

### 2. Feature Components (`components/features/`)
Colocated page components grouped by logical module domain:
- `components/features/landing/` - Hero console animations.
- `components/features/dashboard/` - Telemetry widgets and heatmaps.
- `components/features/admin/` - Monospace matrix sheets, ACL tables, audit log lists.

### 3. Shared Primitives (`components/shared/` & `components/ui/`)
- `components/shared/` - Reusable UI logic (ErrorBoundary, Dialog controllers).
- `components/ui/` - Flat primitive buttons, input fields, and select menus.
- `components/layout/` - Shell structures (NavBar, Footer, SystemConsoleFab).

---

<div align="center">
  <p>Optimized for Performance & Tactical Dominance</p>
</div>
