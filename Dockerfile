ARG NODE_IMAGE=node:22-alpine

FROM ${NODE_IMAGE} AS build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/server/package.json apps/server/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/prompts/package.json packages/prompts/package.json

RUN pnpm install --frozen-lockfile

COPY apps apps
COPY packages packages

RUN pnpm --filter @focusmate/shared build \
  && pnpm --filter @focusmate/server build \
  && pnpm prune --prod

FROM ${NODE_IMAGE} AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8787

COPY --from=build /app /app

WORKDIR /app/apps/server

EXPOSE 8787

CMD ["node", "dist/index.js"]
