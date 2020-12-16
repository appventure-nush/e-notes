FROM node:14
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN npm run build
RUN npm run start
COPY . .
EXPOSE 8080
CMD [ "npm", "start" ]