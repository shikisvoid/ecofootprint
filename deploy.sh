#!/bin/bash

# Eco Footprint App - Google Cloud Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="gen-lang-client-0650130629"
PROJECT_NUMBER="708294481961"
REGION="us-central1"
SERVICE_NAME="eco-footprint-app"
IMAGE_NAME="eco-footprint-app"

# Function to print colored output
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

# Function to check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v gcloud &> /dev/null; then
        print_error "Google Cloud SDK is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install it first."
        exit 1
    fi
    
    print_success "Prerequisites check passed!"
}

# Function to get project ID
get_project_id() {
    if [ -z "$PROJECT_ID" ]; then
        PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
        if [ -z "$PROJECT_ID" ]; then
            print_error "No project ID found. Please set it using: gcloud config set project YOUR_PROJECT_ID"
            exit 1
        fi
    fi
    print_status "Using project: $PROJECT_ID"
}

# Function to enable required APIs
enable_apis() {
    print_status "Enabling required Google Cloud APIs..."
    
    gcloud services enable cloudbuild.googleapis.com \
        run.googleapis.com \
        containerregistry.googleapis.com \
        --project=$PROJECT_ID
    
    print_success "APIs enabled successfully!"
}

# Function to build and push Docker image
build_and_push() {
    print_status "Building Docker image..."
    
    # Build the image
    docker build -t gcr.io/$PROJECT_ID/$IMAGE_NAME:latest .
    
    print_status "Pushing image to Google Container Registry..."
    
    # Configure Docker to use gcloud as a credential helper
    gcloud auth configure-docker --quiet
    
    # Push the image
    docker push gcr.io/$PROJECT_ID/$IMAGE_NAME:latest
    
    print_success "Image built and pushed successfully!"
}

# Function to deploy to Cloud Run
deploy_to_cloud_run() {
    print_status "Deploying to Cloud Run..."
    
    gcloud run deploy $SERVICE_NAME \
        --image gcr.io/$PROJECT_ID/$IMAGE_NAME:latest \
        --region $REGION \
        --platform managed \
        --allow-unauthenticated \
        --port 8080 \
        --memory 1Gi \
        --cpu 1 \
        --min-instances 0 \
        --max-instances 10 \
        --timeout 300 \
        --set-env-vars NODE_ENV=production,VITE_DIALOGFLOW_PROJECT_ID=$PROJECT_ID,VITE_GOOGLE_CLOUD_PROJECT_ID=$PROJECT_ID \
        --project=$PROJECT_ID
    
    # Get the service URL
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)' --project=$PROJECT_ID)

    print_success "Deployment completed!"
    print_success "Your app is available at: $SERVICE_URL"
    print_success "Dialogflow webhook URL: $SERVICE_URL/api/dialogflow-webhook"
}

# Function to set up environment variables
setup_environment() {
    print_warning "Don't forget to set up your environment variables in Cloud Run:"
    echo "1. Go to Google Cloud Console"
    echo "2. Navigate to Cloud Run > $SERVICE_NAME"
    echo "3. Click 'Edit & Deploy New Revision'"
    echo "4. Add these environment variables:"
    echo "   - VITE_FIREBASE_API_KEY"
    echo "   - VITE_FIREBASE_AUTH_DOMAIN"
    echo "   - VITE_FIREBASE_PROJECT_ID"
    echo "   - VITE_FIREBASE_STORAGE_BUCKET"
    echo "   - VITE_FIREBASE_MESSAGING_SENDER_ID"
    echo "   - VITE_FIREBASE_APP_ID"
    echo "   - VITE_WEATHER_API_KEY"
    echo "   - VITE_GEMINI_API_KEY"
    echo "   - VITE_GOOGLE_MAPS_API_KEY"
    echo ""
    echo "🤖 Dialogflow webhook is ready at: $SERVICE_URL/api/dialogflow-webhook"
    echo "📋 Use this URL in your Dialogflow Console fulfillment settings"
}

# Main deployment function
main() {
    print_status "Starting deployment of Eco Footprint App to Google Cloud..."
    
    check_prerequisites
    get_project_id
    enable_apis
    build_and_push
    deploy_to_cloud_run
    setup_environment
    
    print_success "🎉 Deployment completed successfully!"
}

# Run the main function
main "$@"
