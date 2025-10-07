# Use an official lightweight Node runtime as a parent image
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies first (leverage Docker cache)
COPY package.json package-lock.json* ./
RUN npm install --production --silent || npm install --silent

# Copy source
COPY . .

# Generate Prisma client (will retry in entrypoint if DB not ready)
RUN npx prisma generate || true

# Make entrypoint executable
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "src/server.js"]
