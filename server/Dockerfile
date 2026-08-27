# =========================
# DEPENDENCIES
# =========================

FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm ci


# =========================
# BUILD
# =========================

FROM base AS build

COPY tsconfig.json ./
COPY src ./src

RUN npm run build


# =========================
# DATABASE MIGRATIONS
# =========================

FROM base AS migrate

COPY drizzle.config.ts ./
COPY drizzle ./drizzle
COPY src/db ./src/db

CMD ["npx", "drizzle-kit", "migrate"]


# =========================
# PRODUCTION SERVER
# =========================

FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/index.js"]