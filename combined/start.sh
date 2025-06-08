#!/bin/bash

# Start MongoDB
mongod --fork --logpath /var/log/mongod.log

# Start API in background
cd /app/packages/api
node dist/server.js &

# Start UI in foreground
cd /app/packages/ui
serve -s build -l 3000
