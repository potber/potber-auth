ARG NODE_IMAGE=node:24-alpine@sha256:d32cdf619f63fe0471182d08996dd516c6275bb5fd31ae06e55a570bd9e1ad43

FROM ${NODE_IMAGE} AS build
WORKDIR /app

COPY .npmrc package.json package-lock.json ./
RUN npm ci

COPY svelte.config.js tsconfig.json vite.config.js ./
COPY src ./src
COPY static ./static
RUN npm run build

FROM ${NODE_IMAGE} AS runtime
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --chown=node:node package.json ./
COPY --chown=node:node --from=build /app/build ./build

EXPOSE 3000

USER node

CMD ["node", "build"]
