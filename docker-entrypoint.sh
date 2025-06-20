#!/bin/sh

# Replace environment variables in built files
if [ -f /usr/share/nginx/html/index.html ]; then
    # Replace placeholder environment variables with actual values
    envsubst '${VITE_FIREBASE_API_KEY} ${VITE_FIREBASE_AUTH_DOMAIN} ${VITE_FIREBASE_PROJECT_ID} ${VITE_FIREBASE_STORAGE_BUCKET} ${VITE_FIREBASE_MESSAGING_SENDER_ID} ${VITE_FIREBASE_APP_ID} ${VITE_WEATHER_API_KEY}' < /usr/share/nginx/html/index.html > /tmp/index.html
    mv /tmp/index.html /usr/share/nginx/html/index.html
fi

# Start nginx
exec "$@"
