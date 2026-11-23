# Contributing to [ UPSOLVE.it ]

Thank you for your interest in contributing to the Upsolve.it project! We welcome contributions from the competitive programming and engineering community. Please read these guidelines to establish your development pipeline.

---

## 🛠️ Ways to Contribute

- 🐛 **Report System Errors**: Open issues with logs, stack traces, or console snapshots.
- 💡 **Propose Feature Specs**: Suggest new training simulator algorithms, analytics metrics, or visual features.
- 📝 **Code Contributions**: Submit pull requests for bug fixes, performance improvements, or interface tools.
- 📚 **Doc Updates**: Help edit guidelines, roadmap topics instructions, or help files.

---

## ⚙️ Development Workflow

1. **Fork the Repository**
2. **Setup your environment variables**:
   Create a `.env.local` file inside `frontend--upsolve-it`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
   ```
3. **Establish a target feature branch**:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
4. **Run development server**:
   ```bash
   npm install --legacy-peer-deps
   npm run dev
   ```
5. **Verify changes compile correctly**:
   Ensure there are zero linting errors before pushing code. Next.js production builds must succeed:
   ```bash
   npm run lint
   npm run build
   ```
6. **Push updates**:
   ```bash
   git push origin feature/AmazingFeature
   ```
7. **Open a Pull Request** against the main repository.

---

## 🎨 Coding Standards & Aesthetics

- **Strict Dark Monospace Aesthetics**: Avoid adding generic light themes, gradients, or rounded corners (`rounded-xl` or `rounded-full` etc. are generally disabled in the admin dashboard. Keep borders solid and flat: `border border-emerald-500/15`).
- **TypeScript Only**: All code must be strictly typed. Avoid using `any` unless absolutely necessary.
- **Micro-Interactions**: When writing Framer Motion code, cast transitions explicitly (e.g. `type: "spring" as const`).
- **Nesting Rules**: Prevent Next.js hydration failures by using the `asChild` prop on Radix / shadcn Dialog components whenever nesting structural `div` or `p` nodes inside `DialogDescription`.
- **Commit Format**: Write clean, concise uppercase messages (e.g. `ROADMAP: ADD SESSION GATE`, `ACL: UPDATE ROLE DIALOG`).

---

<div align="center">
  <p>Engineered with precision for competitive programmers</p>
</div>
