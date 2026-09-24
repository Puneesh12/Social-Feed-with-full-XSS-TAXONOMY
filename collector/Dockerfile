FROM node:20-alpine
WORKDIR /app
# package.json declares "type":"module" so Node 20 accepts ESM import syntax
COPY package.json ./
COPY server.js ./
EXPOSE 9000
CMD ["node", "server.js"]
