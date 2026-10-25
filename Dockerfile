# Build the static bundle, then serve it with nginx.
# docker build -t shopbd-admin . && docker run --rm -p 8080:80 shopbd-admin
FROM node:26-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# Mocks stay enabled by default so the container is a self-contained demo.
ARG VITE_ENABLE_MOCKS=true
ARG VITE_API_BASE_URL=/api
ENV VITE_ENABLE_MOCKS=$VITE_ENABLE_MOCKS VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:1.31-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/healthz || exit 1
