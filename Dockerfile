# One image for the whole product. Fly runs it as two process groups
# (see fly.toml): `web` serves the Next.js app, `api` serves the NestJS API.

FROM node:24-slim AS backend-build
WORKDIR /src/backend
COPY backend/package.json backend/package-lock.json ./
RUN MONGOMS_DISABLE_POSTINSTALL=1 npm ci --include=dev
COPY backend .
RUN npm run build && npm prune --omit=dev

FROM node:24-slim AS frontend-build
WORKDIR /src/frontend
COPY frontend/package.json frontend/package-lock.json frontend/.npmrc ./
COPY frontend/vendor ./vendor
RUN npm ci --include=dev
COPY frontend .
# Both values are fixed at build time: NEXT_PUBLIC_* is inlined into the
# browser bundle and rewrites are written into the routes manifest.
# Empty NEXT_PUBLIC_API_BASE_URL makes the browser call /api on its own origin;
# API_INTERNAL_URL is where the web process forwards those calls.
ARG NEXT_PUBLIC_API_BASE_URL=""
ARG API_INTERNAL_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL API_INTERNAL_URL=$API_INTERNAL_URL
RUN npm run build

FROM node:24-slim
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=backend-build /src/backend/dist ./backend/dist
COPY --from=backend-build /src/backend/node_modules ./backend/node_modules
COPY --from=backend-build /src/backend/package.json ./backend/package.json
COPY --from=frontend-build /src/frontend/.next/standalone ./frontend
COPY --from=frontend-build /src/frontend/.next/static ./frontend/.next/static
COPY --from=frontend-build /src/frontend/public ./frontend/public
USER node
EXPOSE 3000
CMD ["node", "frontend/server.js"]
