FROM node:18 AS build

WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps && npm install ajv@^8 --legacy-peer-deps
COPY . .

# API calls go through nginx proxy, so baseUrl is just "/"
ENV REACT_APP_BASE_URL=http://localhost:3000/
ENV NODE_OPTIONS=--max-old-space-size=4096

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
