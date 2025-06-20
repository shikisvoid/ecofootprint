#!/bin/bash

# Environment Variables Setup Script
# Project: gen-lang-client-0650130629

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
PROJECT_ID="gen-lang-client-0650130629"
REGION="us-central1"
SERVICE_NAME="eco-footprint-app"

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to prompt for environment variables
get_env_vars() {
    echo "🔧 Setting up environment variables for your Eco Footprint App"
    echo "📋 Project: $PROJECT_ID"
    echo ""
    
    # Firebase Configuration
    print_status "Firebase Configuration:"
    read -p "Enter your Firebase API Key: " FIREBASE_API_KEY
    read -p "Enter your Firebase Auth Domain (e.g., your-project.firebaseapp.com): " FIREBASE_AUTH_DOMAIN
    read -p "Enter your Firebase Project ID: " FIREBASE_PROJECT_ID
    read -p "Enter your Firebase Storage Bucket (e.g., your-project.appspot.com): " FIREBASE_STORAGE_BUCKET
    read -p "Enter your Firebase Messaging Sender ID: " FIREBASE_MESSAGING_SENDER_ID
    read -p "Enter your Firebase App ID: " FIREBASE_APP_ID
    
    # Weather API (pre-filled with your key)
    print_status "Weather API Configuration:"
    WEATHER_API_KEY="57b2f59f486e4d46b40172045253105"
    echo "Weather API Key: $WEATHER_API_KEY (using your provided key)"
    
    echo ""
    print_warning "Please verify all information is correct before proceeding."
    read -p "Continue with deployment? (y/N): " confirm
    
    if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
        print_error "Deployment cancelled."
        exit 1
    fi
}

# Function to update Cloud Run service with environment variables
update_cloud_run() {
    print_status "Updating Cloud Run service with environment variables..."
    
    gcloud run services update $SERVICE_NAME \
        --region $REGION \
        --set-env-vars NODE_ENV=production,\
VITE_FIREBASE_API_KEY="$FIREBASE_API_KEY",\
VITE_FIREBASE_AUTH_DOMAIN="$FIREBASE_AUTH_DOMAIN",\
VITE_FIREBASE_PROJECT_ID="$FIREBASE_PROJECT_ID",\
VITE_FIREBASE_STORAGE_BUCKET="$FIREBASE_STORAGE_BUCKET",\
VITE_FIREBASE_MESSAGING_SENDER_ID="$FIREBASE_MESSAGING_SENDER_ID",\
VITE_FIREBASE_APP_ID="$FIREBASE_APP_ID",\
VITE_WEATHER_API_KEY="$WEATHER_API_KEY" \
        --project=$PROJECT_ID
    
    print_success "Environment variables updated successfully!"
}

# Function to get service URL
get_service_url() {
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)' --project=$PROJECT_ID 2>/dev/null)
    
    if [ -n "$SERVICE_URL" ]; then
        print_success "🌐 Your app is available at: $SERVICE_URL"
    else
        print_warning "Service not found. Please deploy first using ./quick-deploy.sh"
    fi
}

# Main function
main() {
    echo "🔧 Environment Variables Setup for Eco Footprint App"
    echo "=================================================="
    echo ""
    
    # Check if gcloud is installed
    if ! command -v gcloud &> /dev/null; then
        print_error "Google Cloud SDK is not installed."
        exit 1
    fi
    
    # Set project
    gcloud config set project $PROJECT_ID
    
    # Get environment variables from user
    get_env_vars
    
    # Update Cloud Run service
    update_cloud_run
    
    # Get service URL
    get_service_url
    
    echo ""
    print_success "🎉 Environment variables setup completed!"
    print_status "Your Eco Footprint app should now be fully functional."
}

# Run main function
main "$@"
