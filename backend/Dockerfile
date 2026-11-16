# Debian slim (glibc), NOT Alpine: the bcrypt native module's prebuilt binaries
# target glibc — on Alpine (musl) it can fail to load and the backend crashes on
# startup, leaving port 4000 with ERR_CONNECTION_REFUSED.
FROM node:20-slim AS build
WORKDIR /app
# Build tools are a fallback in case a native module must compile from source.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm prune --omit=dev
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
# Reuse the exact node_modules built above — no second install in the runtime image.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 4000
CMD ["sh","-c","node dist/admin/seed.js || true; node dist/main.js"]
