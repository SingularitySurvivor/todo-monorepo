FROM ubuntu:20.04

# Avoid tzdata interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install Node, MongoDB, and other dependencies
RUN apt-get update && apt-get install -y \
  curl \
  gnupg \
  ca-certificates \
  software-properties-common \
  build-essential \
  git \
  wget \
  lsb-release

# Install MongoDB 5.0
RUN curl -fsSL https://www.mongodb.org/static/pgp/server-5.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb.gpg \
  && echo "deb [ signed-by=/usr/share/keyrings/mongodb.gpg ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-5.0.list \
  && apt-get update \
  && apt-get install -y mongodb-org

# Install Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
  && apt-get install -y nodejs

# Setup app working dir
WORKDIR /app

# Copy monorepo files
COPY . .

# Install dependencies and build
RUN npm install && npm run build

# Install static file server
RUN npm install -g serve

# Create required data dir for MongoDB
RUN mkdir -p /data/db

# Add startup script
COPY combined/start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 3000 3001 27017

CMD ["/app/start.sh"]
