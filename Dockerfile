FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build if necessary
RUN npm run build

# Expose port
EXPOSE 8000

# Start the application
CMD ["npm","run", "dev"]