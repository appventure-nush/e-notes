FROM node:14
WORKDIR /usr/src/app
COPY package.json .
RUN npm install
ADD . /usr/src/app
RUN npm run build
COPY . .
EXPOSE 8080
CMD [ "npm", "start" ]