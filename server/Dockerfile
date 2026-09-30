FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
