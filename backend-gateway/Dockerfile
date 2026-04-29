FROM node:20-slim AS base
RUN apt-get update -y && apt-get install -y openssl
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./

# --- STAGE 2: Dependencies ---
FROM base AS deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# --- STAGE 3: Build ---
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN pnpm build

# --- STAGE 4: Production ---
FROM node:20-slim AS runtime
RUN apt-get update -y && apt-get install -y openssl
RUN npm install -g pnpm
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 3000
CMD ["node", "dist/main.js"]
