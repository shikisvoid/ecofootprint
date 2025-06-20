# Build stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set environment variables for Vite build
ENV VITE_FIREBASE_API_KEY=
ENV VITE_FIREBASE_AUTH_DOMAIN=ecofootprint-6ac62.firebaseapp.com
ENV VITE_FIREBASE_PROJECT_ID=ecofootprint-6ac62
ENV VITE_FIREBASE_STORAGE_BUCKET=ecofootprint-6ac62.firebasestorage.com
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=753201402537
ENV VITE_FIREBASE_APP_ID=
ENV VITE_FIREBASE_MEASUREMENT_ID=G-ABCDEFGHIJ
ENV VITE_GEMINI_API_KEY=
ENV VITE_WEATHER_API_KEY=
ENV VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
ENV VITE_DIALOGFLOW_PROJECT_ID=
ENV VITE_GOOGLE_CLOUD_PROJECT_ID=

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files for production dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built app from build stage
COPY --from=build /app/dist ./dist

# Copy server file
COPY server.js ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Set environment variable for port
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the server
CMD ["npm", "start"]
