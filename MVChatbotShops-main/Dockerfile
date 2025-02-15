FROM node:18-alpine3.16 
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

ENV PORT=3000

CMD ["node", "src/index.js"]
