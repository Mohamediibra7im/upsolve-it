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

## 📂 Component Standards

We follow a strict feature-colocated structure:
- `app/help/_Components/`: Feature-specific components.
- `components/ui/`: Low-level primitives.
- `components/layout/`: Core app shell (NavBar, Footer).

---

<div align="center">
  <p>Optimized for Performance & Tactical Dominance</p>
</div>
