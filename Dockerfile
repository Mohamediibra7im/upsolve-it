FROM node:22-slim AS build
WORKDIR /app
COPY package*.json .npmrc ./
COPY vendor ./vendor
RUN npm ci --include=dev
COPY . .
# NEXT_PUBLIC_* values are inlined at build time, so pass them as build args.
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
RUN npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
