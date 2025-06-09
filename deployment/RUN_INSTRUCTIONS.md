# Todo App - Employer Testing Instructions

## Overview
This is a complete full-stack Todo application with authentication, real-time updates, and collaborative features. The entire application (MongoDB database, Node.js API, and React frontend) runs in a single Docker container for easy testing.

## Prerequisites
- Docker installed on your machine
- Ports 3000, 3001, and 27018 available

## Quick Start

### Step 1: Load the Docker Image
```bash
docker load -i todo-app-docker-image.tar
```

### Step 2: Run the Application
```bash
docker run -d -p 3000:3000 -p 3001:3001 -p 27018:27018 --name todo-app todo-app
```

### Step 3: Access the Application
- **Web App**: http://localhost:3000
- **API Health Check**: http://localhost:3001/health

## Stopping the Application
```bash
docker stop todo-app
docker rm todo-app
```

## Troubleshooting

**Port conflicts**: Ensure ports 3000, 3001, and 27018 are not in use by other applications

**Container won't start**: Check Docker logs:
```bash
docker logs todo-app
```

**Database issues**: The container includes its own MongoDB instance - no external database needed

