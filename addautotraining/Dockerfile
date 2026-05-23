# Build stage for client
FROM node:20-alpine AS build

WORKDIR /app

# Accept build arguments
ARG REACT_APP_API_URL
ARG REACT_APP_PAYPAL_CLIENT_ID

# Set environment variables for build
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_PAYPAL_CLIENT_ID=$REACT_APP_PAYPAL_CLIENT_ID

# Copy package files
COPY package*.json ./

# Install dependencies using package-lock for reproducible frontend builds
RUN npm ci --legacy-peer-deps

# Copy source code (excluding backend files)
COPY public ./public
COPY src ./src

# Build the React app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
