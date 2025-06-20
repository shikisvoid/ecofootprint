# 🚀 Eco Footprint App - Google Cloud Deployment Guide

**Project ID:** `gen-lang-client-0650130629`  
**Project Number:** `708294481961`  
**Region:** `us-central1`

## 🎯 Quick Start (Recommended)

### Step 1: Prerequisites
```bash
# Install Google Cloud SDK (if not already installed)
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Install Docker (if not already installed)
# For macOS: brew install docker
# For Ubuntu: sudo apt-get install docker.io
```

### Step 2: Authenticate with Google Cloud
```bash
# Login to Google Cloud
gcloud auth login

# Set your project (already configured in scripts)
gcloud config set project gen-lang-client-0650130629
```

### Step 3: Deploy Your App
```bash
# One-command deployment
./quick-deploy.sh
```

### Step 4: Set Environment Variables
```bash
# Interactive setup for Firebase and API keys
./set-env-vars.sh
```

## 🔧 Manual Deployment (Alternative)

If you prefer manual control:

### 1. Enable APIs
```bash
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com
```

### 2. Build and Push Docker Image
```bash
# Configure Docker for Google Container Registry
gcloud auth configure-docker

# Build the image
docker build -t gcr.io/gen-lang-client-0650130629/eco-footprint-app:latest .

# Push to registry
docker push gcr.io/gen-lang-client-0650130629/eco-footprint-app:latest
```

### 3. Deploy to Cloud Run
```bash
gcloud run deploy eco-footprint-app \
  --image gcr.io/gen-lang-client-0650130629/eco-footprint-app:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 80 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --project gen-lang-client-0650130629
```

### 4. Set Environment Variables
```bash
gcloud run services update eco-footprint-app \
  --region us-central1 \
  --set-env-vars NODE_ENV=production,\
VITE_FIREBASE_API_KEY=your-firebase-api-key,\
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com,\
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id,\
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com,\
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id,\
VITE_FIREBASE_APP_ID=your-app-id,\
VITE_WEATHER_API_KEY=57b2f59f486e4d46b40172045253105 \
  --project gen-lang-client-0650130629
```

## 🔑 Required Environment Variables

You'll need these from your Firebase project:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase API Key | `AIzaSyC...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | `your-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | `123456789` |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | `1:123:web:abc` |
| `VITE_WEATHER_API_KEY` | Weather API Key | `57b2f59f486e4d46b40172045253105` |

## 📊 Monitoring Your Deployment

### Check Service Status
```bash
gcloud run services describe eco-footprint-app --region us-central1
```

### View Logs
```bash
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=eco-footprint-app" --limit 50
```

### Get Service URL
```bash
gcloud run services describe eco-footprint-app --region us-central1 --format='value(status.url)'
```

## 🔄 Updating Your App

To deploy updates:

```bash
# Rebuild and redeploy
./quick-deploy.sh

# Or manually:
docker build -t gcr.io/gen-lang-client-0650130629/eco-footprint-app:latest .
docker push gcr.io/gen-lang-client-0650130629/eco-footprint-app:latest
gcloud run deploy eco-footprint-app --image gcr.io/gen-lang-client-0650130629/eco-footprint-app:latest --region us-central1
```

## 🐛 Troubleshooting

### Common Issues:

1. **Authentication Error:**
   ```bash
   gcloud auth login
   gcloud auth configure-docker
   ```

2. **Permission Denied:**
   ```bash
   gcloud projects add-iam-policy-binding gen-lang-client-0650130629 \
     --member="user:your-email@gmail.com" \
     --role="roles/run.admin"
   ```

3. **Service Not Found:**
   - Make sure you're in the correct project
   - Check the service name and region

4. **Build Fails:**
   - Check Docker is running
   - Verify all dependencies in package.json

### Debug Commands:
```bash
# Check current project
gcloud config get-value project

# List Cloud Run services
gcloud run services list --region us-central1

# Check service logs
gcloud logs tail "resource.type=cloud_run_revision"
```

## 💰 Cost Estimation

With the current configuration:
- **Free tier:** 2 million requests/month
- **Pricing:** $0.40 per million requests after free tier
- **Memory:** 512Mi at $0.000002 per GB-second
- **CPU:** 1 vCPU at $0.000024 per vCPU-second

Expected monthly cost for moderate usage: **$0-5**

## 🎉 Success!

After successful deployment, your app will be available at:
`https://eco-footprint-app-[hash]-uc.a.run.app`

The exact URL will be shown after running the deployment script.

## 📞 Need Help?

1. Check the troubleshooting section above
2. Review Google Cloud Run documentation
3. Verify all environment variables are set correctly
4. Check application logs for specific errors

---

**Happy Deploying! 🌱🚀**
