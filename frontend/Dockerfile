FROM node:20

WORKDIR /frontend

COPY . .

RUN npm install -g next
RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]