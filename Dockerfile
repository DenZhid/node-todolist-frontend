FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html ./
COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY vite.config.ts ./
COPY src ./src

# Same-origin via nginx: "/" strips to "" so fetch uses relative /api, /login
ARG VITE_API_BASE_URL=/
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

FROM nginx:1.27-alpine AS runner

# CN/SAN for the self-signed cert (IP or hostname clients will open)
ARG SSL_CN=localhost
RUN apk add --no-cache openssl \
  && mkdir -p /etc/nginx/certs \
  && if echo "${SSL_CN}" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$'; then \
       SAN="IP:${SSL_CN},IP:127.0.0.1"; \
     else \
       SAN="DNS:${SSL_CN},DNS:localhost,IP:127.0.0.1"; \
     fi \
  && openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
    -keyout /etc/nginx/certs/selfsigned.key \
    -out /etc/nginx/certs/selfsigned.crt \
    -subj "/CN=${SSL_CN}" \
    -addext "subjectAltName=${SAN}" \
  && apk del openssl

# nginx image runs envsubst on templates/*.template → conf.d/
ENV API_UPSTREAM=host.docker.internal:3000
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
