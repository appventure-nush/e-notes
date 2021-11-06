FROM node:14
WORKDIR /usr/src/app
COPY . .

WORKDIR /usr/src/app/frontend
RUN npm run docker
EXPOSE 8080
CMD [ "npm", "start" ]