FROM node:14
WORKDIR /usr/src/app
COPY . .

WORKDIR /usr/src/app/frontend
RUN npm install
RUN npm run build
COPY /usr/src/app/frontend/dist /usr/src/app/backend/public

WORKDIR /usr/src/app/backend
RUN npm install
RUN npm run build
EXPOSE 8080
CMD [ "npm", "start" ]