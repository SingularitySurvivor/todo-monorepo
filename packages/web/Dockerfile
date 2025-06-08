# Stage 1: build
FROM node:18 AS build

WORKDIR /app

# Copy monorepo root + UI dependencies
COPY package*.json ./
COPY packages/ui/package*.json ./packages/ui/

RUN npm install

# Copy the full monorepo to access shared code, if any
COPY . .

# Build React app
WORKDIR /app/packages/ui
RUN npm run build

# Stage 2: serve the build output
FROM node:18

WORKDIR /app

RUN npm install -g serve
COPY --from=build /app/packages/ui/build ./build

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
