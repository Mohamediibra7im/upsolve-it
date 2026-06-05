# [ UPSOLVE.it ] | Command Interface

> **Frontend Protocol: ALPHA-7**
> A high-fidelity, glassmorphic dashboard for elite competitive programmers.

---

## Design Philosophy: "The Command Console"

The Upsolve.it interface is designed to feel like a tactical engineering terminal. It prioritizes data density, visual clarity, and professional-grade aesthetics.

- **Centered Navigation**: A balanced, high-end navigation system with centered links and a tactical profile dropdown.
- **Glassmorphism**: Sophisticated backdrop blurs and subtle borders for a modern "OS" feel.
- **Emerald Primary**: High-contrast, accessibility-tested color palette centered around #007F5F.

## Technical Stack

- **Framework**: Next.js 16+ (App Router)
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Components**: Radix UI + Shadcn/ui
- **State/Data**: SWR (Stale-While-Revalidate)
- **Motion**: Framer Motion for micro-interactions
- **Icons**: Lucide React (Tactical set)
- **Testing**: Jest + React Testing Library

## Key Interface Modules

### 1. Signal Support Console
A premium contact portal with localized terminology ("Inbound Signal", "Transmission Status") and high-fidelity form validation.

### 2. Tactical Dashboard
Real-time Codeforces synchronization, rating progression charts (Recharts), and activity heatmaps.

### 3. Training Center
Intelligent problem generation with custom filters for tags and difficulty levels.

## Getting Started

1. **Environment Config**:
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
   ```

2. **Launch Protocol**:
   ```bash
   npm install --legacy-peer-deps
   npm run dev
   ```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |

## Folder Architecture & Standards

### 1. Route Groups (`app/`)
- **`app/(auth)/`** - Login, signup, reset-password (navbar-free, centered layouts)
- **`app/(main)/`** - Dashboard, training, roadmap, statistics (padded container with nav)
- **`app/(marketing)/`** - Landing, help, community, privacy (edge-to-edge full-bleed)
- **`app/admin/`** - Admin control panel with sidebar console

### 2. Feature Components (`components/features/`)
Colocated page-specific components organized by domain:
- `components/features/landing/` - Hero, Showcase, etc.
- `components/features/dashboard/` - Stats, Streaks, Sidebar widgets
- `components/features/training/`, `roadmap/`, `admin/` - Module-specific interfaces

### 3. Shared Components (`components/shared/` & `components/ui/`)
- `components/shared/` - Reusable utilities (Loader, ConfirmDialog, ErrorBoundary)
- `components/ui/` - Primitive UI components (Radix + shadcn/ui)
- `components/layout/` - Shell structures (NavBar, Footer, HelpFab)

### 4. Domain-Scoped Hooks (`hooks/`)
- `hooks/auth/` - `useUser`
- `hooks/training/` - `useTraining`, `useProblems`
- `hooks/social/` - `useFriends`
- `hooks/roadmap/` - `useRoadmap`, `useLevels`
- `hooks/data/` - `useHeatmapData`, `useHistory`

---

<div align="center">
  <p>Optimized for Performance & Tactical Dominance</p>
</div>
