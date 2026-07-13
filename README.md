# [ UPSOLVE.it ] | Interface Cockpit

> **Frontend Protocol: COMMAND-CONSOLE-V3**
> A high-fidelity, monospaced dark terminal dashboard for elite competitive programmers.
>
> 📡 **Backend Core Service**: [upsolve-it--backend](https://github.com/Mohamediibra7im/upsolve-it--backend)

---

## ⚡ Design Philosophy: "The Technical Cockpit"

The Upsolve.it frontend interface is engineered to feel like a high-end command line workstation. It prioritizes information density, retro-futuristic styling, and precise responsive execution.

- **Locked Dark Mode Theme**: Strict dark-mode visual palette to prevent screen glare and minimize visual load during long coding sessions.
- **Unified sliding FAB System**: Consolidates auxiliary actions (`[ HELP ]`, `[ NEWS ]`, `[ SUGG ]`) into a single sliding menu triggered via a pulsing CPU icon.
- **Flat Monospace Components**: High-fidelity terminal aesthetics with square corners, solid borders (`border-emerald-500/15`), typewriter labels, and **ASCII-progress charts** (`[██████░░░░]`).
- **Telemetry Charts**: Flattened and customized log-style overlays for Area and Bar charts.
- **Telemetry OG Generation**: Refactored Open Graph metadata images displaying tactical system overlays and rating parameters.

---

## 🛠️ Technical Stack

- **Framework**: Next.js 16+ (App Router)
- **Engine**: Turbopack compiler
- **Styling**: Vanilla Tailwind CSS + Custom theme variables
- **Components**: Radix UI + Custom shadcn primitives
- **Data Hydration**: SWR (Stale-While-Revalidate)
- **Transitions**: Framer Motion configured with strict type variants
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
