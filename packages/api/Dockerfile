FROM node:18

WORKDIR /app

# Copy root package.json and workspaces
COPY package*.json ./
COPY packages/api/package*.json ./packages/api/
COPY packages/ui/package*.json ./packages/ui/

# Install deps across the whole monorepo
RUN npm install

# Copy the full monorepo for build
COPY . .

# Build only the API
WORKDIR /app/packages/api
RUN npm run build

EXPOSE 3001
CMD ["node", "dist/server.js"]
