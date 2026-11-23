# Upsolve.it

Upsolve.it helps competitive programmers finish what contests leave behind:
it collects the problems you could not solve, reminds you about them, and
tracks your progress as you clear them.

| Folder | What it is | Stack |
|---|---|---|
| [`frontend/`](frontend) | Web app | Next.js, React, Tailwind |
| [`backend/`](backend) | REST API | NestJS, MongoDB |

## Run it locally

```bash
cd backend && npm ci && npm run dev
```

```bash
cd frontend && npm ci && npm run dev
```

Each folder has its own `.env.example`, README and tests. CI runs per
folder: a change under `frontend/` only runs the frontend checks, and a
change under `backend/` only runs the backend checks.

## Deployment

The two folders are separate Fly.io apps, each with its own `fly.toml` and
Dockerfile, and each deployed by its own workflow on pushes to `main`:

| Folder | Fly app | Workflow | Repository secret |
|---|---|---|---|
| `frontend/` | `upsolve-it-frontend` | `frontend.yml` | `FLY_API_TOKEN_FRONTEND` |
| `backend/` | `upsolve-it-backend` | `backend.yml` | `FLY_API_TOKEN_BACKEND` |

A deploy runs only when files in that folder changed and its checks passed.
