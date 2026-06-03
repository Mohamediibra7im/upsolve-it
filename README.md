# [ UPSOLVE.it ] | Command Interface

> **Frontend Protocol: ALPHA-7**
> A high-fidelity, glassmorphic dashboard for elite competitive programmers.

---

## 🎨 Design Philosophy: "The Command Console"

The Upsolve.it interface is designed to feel like a tactical engineering terminal. It prioritizes data density, visual clarity, and professional-grade aesthetics.

- **Centered Navigation**: A balanced, high-end navigation system with centered links and a tactical profile dropdown.
- **Glassmorphism**: Sophisticated backdrop blurs and subtle borders for a modern "OS" feel.
- **Emerald Primary**: High-contrast, accessibility-tested color palette centered around #007F5F.

## 🛠️ Technical Stack

- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Components**: Radix UI + Shadcn/ui
- **State/Data**: SWR (Stale-While-Revalidate)
- **Motion**: Framer Motion for micro-interactions
- **Icons**: Lucide React (Tactical set)

## 🚀 Key Interface Modules

### 1. Signal Support Console
A premium contact portal with localized terminology ("Inbound Signal", "Transmission Status") and high-fidelity form validation.

### 2. Tactical Dashboard
Real-time Codeforces synchronization, rating progression charts (Recharts), and activity heatmaps.

### 3. Training Center
Intelligent problem generation with custom filters for tags and difficulty levels.

## 📦 Getting Started

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

## 📂 Folder Architecture & Standards

We follow a clean, modular, and domain-scoped architecture to maximize reuse and maintainability:

### 1. Route Groups (`app/`)
Routing folders are grouped by layout rules using Next.js **Route Groups** (omitted from URL paths):
- **`app/(auth)/`** (`/login`, `/signup`, `/reset-password`) - Navbar-free, centered layouts.
- **`app/(main)/`** (`/dashboard`, `/training`, `/roadmap`, `/statistics`, etc.) - Padded container layout with navigation header and footer.
- **`app/(marketing)/`** (`/`, `/help`, `/community`, `/privacy`) - Edge-to-edge full-bleed layouts with navigation header and footer.
- **`app/admin/`** - Dedicated admin control panel layout with sidebar console.

### 2. Feature Components (`components/features/`)
Colocated page-specific components are organized under `components/features/{domain}/` to keep the `app/` folder focused strictly on routing:
- `components/features/landing/` - Extracted landing sections (Hero, Showcase, etc.).
- `components/features/dashboard/` - Extracted dashboard cards and widgets (Stats, Streaks, Sidebar).
- `components/features/training/`, `roadmap/`, `admin/`, etc. - Module-specific interfaces.

### 3. Shared Components (`components/shared/` & `components/ui/`)
- `components/shared/` - Reusable application utilities (`Loader`, `ConfirmDialog`, `ActivityHeatmap`).
- `components/ui/` - Primitive, headless styling primitives (Radix + shadcn/ui).
- `components/layout/` - Shell chrome structures (`NavBar`, `Footer`, `HelpFab`).

### 4. Domain-Scoped Hooks (`hooks/`)
Custom React hooks are organized into domain subdirectories with barrel exports:
- `hooks/auth/` (e.g. `useUser`)
- `hooks/training/` (e.g. `useTraining`, `useProblems`)
- `hooks/social/` (e.g. `useFriends`)
- `hooks/roadmap/` (e.g. `useRoadmap`, `useLevels`)
- `hooks/data/` (e.g. `useHeatmapData`, `useHistory`)

---

<div align="center">
  <p>Optimized for Performance & Tactical Dominance</p>
</div>

