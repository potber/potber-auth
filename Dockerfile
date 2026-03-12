FROM node:24-bullseye-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . ./
RUN npm run build

FROM node:24-alpine
WORKDIR /app
COPY --from=build --chown=node:node /app/build ./build

EXPOSE 3000

USER node
CMD [ "node", "build" ]
