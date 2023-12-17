FROM node:20

WORKDIR /backend

COPY . .

RUN npm i -g @nestjs/cli
RUN npm install

EXPOSE 3000

CMD ["npm", "run", "start::dev"]