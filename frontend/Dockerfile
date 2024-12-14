FROM node:18-alpine

WORKDIR /app

COPY package.json ./
RUN if [ ! -f yarn.lock ]; then \
        npm install; \
    else \
        yarn install; \
    fi

COPY . .

EXPOSE 5173 