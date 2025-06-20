# 🚀 EcoCloudApp Deployment Guide - Google Cloud Run

This guide will help you deploy your EcoCloudApp to Google Cloud Run.

## 📋 Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Google Cloud CLI** installed and authenticated
3. **Docker** installed (optional, we'll use Cloud Build)
4. **Project ID**: `gen-lang-client-0650130629`

## 🛠️ Quick Setup

### 1. Install Google Cloud CLI (if not installed)

**Windows:**
```powershell
# Download and install from: https://cloud.google.com/sdk/docs/install
# Or use Chocolatey:
choco install gcloudsdk
```

**macOS:**
```bash
# Using Homebrew:
brew install --cask google-cloud-sdk
```

**Linux:**
```bash
# Download and install:
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### 2. Authenticate with Google Cloud

```bash
# Login to your Google account
gcloud auth login

# Set your project
gcloud config set project gen-lang-client-0650130629

# Enable Application Default Credentials
gcloud auth application-default login
```

### 3. Enable Required APIs

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

## 🚀 Deployment Options

### Option 1: Automated Deployment (Recommended)

```bash
# Make the script executable (Linux/macOS)
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

**For Windows PowerShell:**
```powershell
# Run the deployment using gcloud directly
gcloud builds submit --config cloudbuild.yaml .
```

### Option 2: Manual Deployment

```bash
# 1. Build and deploy using Cloud Build
gcloud builds submit --config cloudbuild.yaml .

# 2. Get your service URL
gcloud run services describe eco-footprint-app --region=us-central1 --format="value(status.url)"
```

### Option 3: Local Docker Build + Deploy

```bash
# 1. Build the Docker image
docker build -t gcr.io/gen-lang-client-0650130629/eco-footprint-app:latest .

# 2. Configure Docker for GCR
gcloud auth configure-docker

# 3. Push the image
docker push gcr.io/gen-lang-client-0650130629/eco-footprint-app:latest

# 4. Deploy to Cloud Run
gcloud run deploy eco-footprint-app \
  --image gcr.io/gen-lang-client-0650130629/eco-footprint-app:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1
```

## 🔧 Environment Variables

Your app needs these environment variables. Set them in Cloud Run:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=gen-lang-client-0650130629.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gen-lang-client-0650130629
VITE_FIREBASE_STORAGE_BUCKET=gen-lang-client-0650130629.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=708294481961
VITE_FIREBASE_APP_ID=your-app-id

# API Keys
VITE_WEATHER_API_KEY=57b2f59f486e4d46b40172045253105
VITE_GEMINI_API_KEY=your-gemini-api-key

# Environment
NODE_ENV=production
```

## 🎯 Quick Commands

```bash
# Check deployment status
gcloud run services list

# View logs
gcloud run services logs read eco-footprint-app --region=us-central1

# Update service
gcloud run services update eco-footprint-app --region=us-central1

# Delete service
gcloud run services delete eco-footprint-app --region=us-central1
```

## 🌐 Access Your App

After deployment, your app will be available at:
`https://eco-footprint-app-[hash]-uc.a.run.app`

## 🔍 Troubleshooting

### Common Issues:

1. **Port Issues**: Make sure your app listens on port 8080
2. **Build Failures**: Check `cloudbuild.yaml` configuration
3. **Permission Issues**: Ensure proper IAM roles
4. **Environment Variables**: Set all required variables in Cloud Run

### Useful Commands:

```bash
# Check build logs
gcloud builds list

# View specific build
gcloud builds log [BUILD_ID]

# Check service details
gcloud run services describe eco-footprint-app --region=us-central1
```

## 🎉 Success!

Your EcoCloudApp should now be live on Google Cloud Run with:
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Auto-scaling
- ✅ Pay-per-use pricing
- ✅ High availability
