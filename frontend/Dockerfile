# 開発環境
FROM node:20 AS development

WORKDIR /frontend
COPY . .
RUN npm install -g next
RUN npm install
EXPOSE 3000

CMD ["npm", "run", "dev"]

# 本番環境
FROM node:20 AS production

ENV NODE_ENV=production
WORKDIR /frontend
COPY --from=development /frontend .
RUN npm install --only=production
RUN npm run build
EXPOSE 3000

CMD ["npm", "run", "start"]