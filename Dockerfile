ARG NODE_IMAGE=node:22-alpine

FROM ${NODE_IMAGE} AS build

WORKDIR /app

ENV CI=true
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

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
  && pnpm --filter @focusmate/server build

FROM ${NODE_IMAGE} AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8787
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json apps/server/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/prompts/package.json packages/prompts/package.json

RUN pnpm install --prod --frozen-lockfile --filter @focusmate/server...

COPY --from=build /app/apps/server/dist apps/server/dist
COPY --from=build /app/packages/shared/dist packages/shared/dist
COPY packages/prompts packages/prompts

WORKDIR /app/apps/server

EXPOSE 8787

CMD ["node", "dist/index.js"]
