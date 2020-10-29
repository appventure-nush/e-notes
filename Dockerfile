FROM node:12-alpine

RUN adduser -S vue
USER vue
RUN mkdir /home/vue
WORKDIR /home/vue
COPY --chown=vue:root . .
WORKDIR backend

RUN npm ci
RUN npm run build
