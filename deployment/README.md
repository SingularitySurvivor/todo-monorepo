# Todo App Deployment

This directory contains Docker configuration to run the complete Todo application with MongoDB, API, and web frontend in a single container for easy testing by prospective employers.

## Quick Start

From the project root directory, run:

```bash
# Option 1: Build and run with docker-compose
cd deployment
docker-compose up --build

# Option 2: Build and run directly with Docker
docker build -f deployment/Dockerfile -t todo-app .
docker run -d -p 3000:3000 -p 3001:3001 -p 27018:27018 --name todo-app todo-app
```

## Access Points

- **Web App**: http://localhost:3000
- **API**: http://localhost:3001
- **MongoDB**: localhost:27018

## What's Included

- MongoDB 5.0 database (isolated from local MongoDB)
- Node.js API server (Express)
- React web frontend
- All dependencies and build artifacts

## Architecture

The container runs:
1. MongoDB on port 27018 in the background
2. API server on port 3001
3. Web frontend served on port 3000

All services start automatically when the container runs.

## Stopping the Container

```bash
docker stop todo-app
docker rm todo-app
```
