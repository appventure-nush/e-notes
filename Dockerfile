FROM node:14-alpine as build
WORKDIR /app
COPY ./frontend .
RUN npm install
RUN npm run build

FROM node:14-alpine as deploy
WORKDIR /usr/src/app/backend
COPY ./backend .
COPY --from=build /app/dist ./public
RUN npm run docker
EXPOSE 8080
CMD [ "npm", "start" ]