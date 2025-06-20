#!/bin/bash

# Quick Deploy Script for Eco Footprint App
# Project: gen-lang-client-0650130629
# Project Number: 708294481961

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project Configuration
PROJECT_ID="gen-lang-client-0650130629"
PROJECT_NUMBER="708294481961"
REGION="us-central1"
SERVICE_NAME="eco-footprint-app"
IMAGE_NAME="eco-footprint-app"

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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v gcloud &> /dev/null; then
        print_error "Google Cloud SDK is not installed. Please install it first."
        echo "Install: curl https://sdk.cloud.google.com | bash"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install it first."
        exit 1
    fi
    
    print_success "Prerequisites check passed!"
}

# Set up Google Cloud project
setup_gcloud() {
    print_status "Setting up Google Cloud configuration..."
    
    # Set project
    gcloud config set project $PROJECT_ID
    
    # Enable required APIs
    print_status "Enabling required APIs..."
    gcloud services enable cloudbuild.googleapis.com \
        run.googleapis.com \
        containerregistry.googleapis.com \
        --project=$PROJECT_ID
    
    print_success "Google Cloud setup completed!"
}

# Build and deploy
build_and_deploy() {
    print_status "Building and deploying application..."
    
    # Configure Docker for GCR
    gcloud auth configure-docker --quiet
    
    # Build the image
    print_status "Building Docker image..."
    docker build -t gcr.io/$PROJECT_ID/$IMAGE_NAME:latest .
    
    # Push the image
    print_status "Pushing image to Google Container Registry..."
    docker push gcr.io/$PROJECT_ID/$IMAGE_NAME:latest
    
    # Deploy to Cloud Run
    print_status "Deploying to Cloud Run..."
    gcloud run deploy $SERVICE_NAME \
        --image gcr.io/$PROJECT_ID/$IMAGE_NAME:latest \
        --region $REGION \
        --platform managed \
        --allow-unauthenticated \
        --port 80 \
        --memory 512Mi \
        --cpu 1 \
        --min-instances 0 \
        --max-instances 10 \
        --set-env-vars NODE_ENV=production \
        --project=$PROJECT_ID
    
    # Get the service URL
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)' --project=$PROJECT_ID)
    
    print_success "🎉 Deployment completed successfully!"
    print_success "Your app is available at: $SERVICE_URL"
    
    # Show next steps
    echo ""
    print_warning "⚠️  IMPORTANT: Don't forget to set your environment variables!"
    echo "Run this command to set your Firebase and API keys:"
    echo ""
    echo "gcloud run services update $SERVICE_NAME \\"
    echo "  --region $REGION \\"
    echo "  --set-env-vars VITE_FIREBASE_API_KEY=your-firebase-api-key,\\"
    echo "  VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com,\\"
    echo "  VITE_FIREBASE_PROJECT_ID=your-firebase-project-id,\\"
    echo "  VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com,\\"
    echo "  VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id,\\"
    echo "  VITE_FIREBASE_APP_ID=your-app-id,\\"
    echo "  VITE_WEATHER_API_KEY=57b2f59f486e4d46b40172045253105"
    echo ""
}

# Main function
main() {
    echo "🚀 Starting deployment of Eco Footprint App"
    echo "📋 Project ID: $PROJECT_ID"
    echo "📋 Project Number: $PROJECT_NUMBER"
    echo "🌍 Region: $REGION"
    echo ""
    
    check_prerequisites
    setup_gcloud
    build_and_deploy
    
    print_success "🎉 All done! Your eco footprint app is now live on Google Cloud!"
}

# Run main function
main "$@"
