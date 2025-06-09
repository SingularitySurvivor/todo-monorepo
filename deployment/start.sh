#!/bin/bash

# Start MongoDB on port 27018 to avoid conflicts
mongod --port 27018 --fork --logpath /var/log/mongod.log

# Start API in background with MongoDB on port 27018
cd /app/packages/api
MONGODB_URI=mongodb://localhost:27018/todoapp node dist/server.js &

# Start UI in foreground
cd /app/packages/web
serve -s build -l 3000