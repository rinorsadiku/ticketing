FROM node:13-alpine

WORKDIR /app
COPY ./package.json ./
RUN npm install --only=prod
COPY ./ ./
RUN npm run build

CMD ["npm", "run", "start:dev"]