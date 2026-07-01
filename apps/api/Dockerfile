# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
RUN corepack enable

# Prune the monorepo down to just what apps/api actually needs
FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune api --docker

# Install deps against the pruned lockfile, then build
FROM base AS builder
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
# turbo prune only tracks package-scoped files — a root-level shared
# tsconfig extended via relative path doesn't survive it, so it's
# copied back in explicitly.
COPY tsconfig.base.json ./tsconfig.base.json
# @prisma/client's postinstall (during pnpm install above) ran before
# prisma/schema.prisma existed in this stage, so it generated an
# untyped client. Regenerating now against the real schema, before build.
RUN pnpm --filter api exec prisma generate
RUN npm install -g turbo
RUN turbo build --filter=api

# Minimal runtime image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json
# pnpm's strict per-package linking means shared's own require('zod') needs
# its own node_modules copied too — the root/api copies above don't cover it.
COPY --from=builder /app/packages/shared/node_modules ./packages/shared/node_modules

WORKDIR /app/apps/api
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
