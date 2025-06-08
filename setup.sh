#!/bin/bash

# Setup script for the market research monorepo

# Display a message
echo "Setting up market research monorepo..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Create .env files if they don't exist
if [ ! -f "./packages/api/.env" ]; then
  echo "Creating API .env file..."
  cp ./packages/api/.env.example ./packages/api/.env 2>/dev/null || echo "# API Environment Variables
PORT=5000
MONGODB_URI=mongodb://localhost:27017/market-research
JWT_SECRET=your_jwt_secret
NODE_ENV=development
" > ./packages/api/.env
fi

if [ ! -f "./packages/ui/.env" ]; then
  echo "Creating UI .env file..."
  cp ./packages/ui/.env.example ./packages/ui/.env 2>/dev/null || echo "# UI Environment Variables
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
" > ./packages/ui/.env
fi

if [ ! -f "./packages/tests/.env" ]; then
  echo "Creating tests .env file..."
  cp ./packages/tests/.env.example ./packages/tests/.env 2>/dev/null || echo "# Test Environment Variables
API_URL=http://localhost:5000/api
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=password123
" > ./packages/tests/.env
fi

# Build all packages
echo "Building packages..."
npm run build

echo "Setup complete! You can now run 'npm run dev' to start the development servers."