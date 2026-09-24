# Multi-stage: build the SPA with Vite, then serve the static files with nginx.
FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_BUILD_MODE=vulnerable
ENV VITE_BUILD_MODE=${VITE_BUILD_MODE}
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
# SPA fallback so hash routes and deep links serve index.html.
COPY nginx.web.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
