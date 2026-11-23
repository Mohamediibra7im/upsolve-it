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

Each folder has its own `.env.example`, README and tests. Locally the web app
calls the API directly, using `NEXT_PUBLIC_API_BASE_URL` from `frontend/.env`.

## Deployment

Both folders ship as one Docker image to one Fly.io app, defined by the root
`Dockerfile` and `fly.toml`. Fly runs the image as two process groups:

| Process | What runs | Reachable from |
|---|---|---|
| `web` | Next.js app | The internet |
| `api` | NestJS API | Only `web`, over Fly's private network |

The browser talks to a single origin. `web` forwards `/api/*` to `api`, so
there is no cross-origin setup in production.

`.github/workflows/ci.yml` runs the frontend and backend checks on every pull
request and push to `main`. A push to `main` deploys once both pass, using the
`FLY_API_TOKEN` repository secret.
