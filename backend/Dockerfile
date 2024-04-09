# 開発環境
FROM node:20 AS development

WORKDIR /backend
COPY package.*json ./
RUN npm install
COPY . .
EXPOSE 3000
RUN npm run build

CMD ["npm", "run", "start:dev"]

# 本番環境
FROM node:20 AS production

ENV NODE_ENV=production
WORKDIR /backend
COPY package.*json ./
RUN npm install --only=prod
COPY --from=development /backend/dist ./dist

CMD ["npm", "run", "start:prod"]