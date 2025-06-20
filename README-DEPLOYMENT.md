# 🚀 Eco Footprint App - Google Cloud Deployment Guide

This guide will help you deploy your Eco Footprint tracking application to Google Cloud using Docker containers.

## 📋 Prerequisites

Before you begin, make sure you have:

1. **Google Cloud Account** with billing enabled
2. **Google Cloud SDK** installed and configured
3. **Docker** installed on your local machine
4. **Firebase project** set up with your configuration
5. **Weather API key** from OpenWeatherMap

## 🛠️ Installation & Setup

### 1. Install Google Cloud SDK

```bash
# For macOS
brew install google-cloud-sdk

# For Ubuntu/Debian
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# For Windows
# Download and install from: https://cloud.google.com/sdk/docs/install
```

### 2. Authenticate with Google Cloud

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### 3. Enable Required APIs

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

## 🚀 Deployment Options

### Option 1: Quick Deployment (Recommended)

Use the automated deployment script:

```bash
# Make the script executable
chmod +x deploy.sh

# Run the deployment
./deploy.sh
```

### Option 2: Manual Docker Deployment

#### Step 1: Build the Docker Image

```bash
# Build the image
docker build -t gcr.io/YOUR_PROJECT_ID/eco-footprint-app:latest .

# Configure Docker for GCR
gcloud auth configure-docker

# Push the image
docker push gcr.io/YOUR_PROJECT_ID/eco-footprint-app:latest
```

#### Step 2: Deploy to Cloud Run

```bash
gcloud run deploy eco-footprint-app \
  --image gcr.io/YOUR_PROJECT_ID/eco-footprint-app:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 80 \
  --memory 512Mi \
  --cpu 1
```

### Option 3: Using Cloud Build

```bash
# Submit build to Cloud Build
gcloud builds submit --config cloudbuild.yaml .
```

### Option 4: Using Terraform

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

terraform init
terraform plan
terraform apply
```

## 🔧 Environment Variables

Set these environment variables in your Cloud Run service:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase API Key | `AIzaSyC...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | `your-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | `123456789` |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | `1:123:web:abc` |
| `VITE_WEATHER_API_KEY` | OpenWeatherMap API Key | `57b2f59f486e4d46b40172045253105` |

### Setting Environment Variables

#### Via Google Cloud Console:
1. Go to Cloud Run in the Google Cloud Console
2. Select your service
3. Click "Edit & Deploy New Revision"
4. Add environment variables in the "Variables" tab

#### Via Command Line:
```bash
gcloud run services update eco-footprint-app \
  --region us-central1 \
  --set-env-vars VITE_FIREBASE_API_KEY=your-api-key,VITE_FIREBASE_AUTH_DOMAIN=your-domain.firebaseapp.com
```

## 🔒 Security Best Practices

1. **Use Secret Manager** for sensitive data:
```bash
# Store secrets
gcloud secrets create firebase-api-key --data-file=-
echo "your-api-key" | gcloud secrets create firebase-api-key --data-file=-

# Use in Cloud Run
gcloud run services update eco-footprint-app \
  --region us-central1 \
  --set-env-vars VITE_FIREBASE_API_KEY=projects/YOUR_PROJECT_ID/secrets/firebase-api-key/versions/latest
```

2. **Enable HTTPS** (automatically enabled in Cloud Run)

3. **Set up proper IAM roles** for your service accounts

## 📊 Monitoring & Logging

### View Logs
```bash
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=eco-footprint-app" --limit 50
```

### Monitor Performance
- Go to Cloud Run in Google Cloud Console
- Click on your service
- View metrics in the "Metrics" tab

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Cloud SDK
      uses: google-github-actions/setup-gcloud@v0
      with:
        project_id: ${{ secrets.GCP_PROJECT_ID }}
        service_account_key: ${{ secrets.GCP_SA_KEY }}
        export_default_credentials: true
    
    - name: Build and Deploy
      run: |
        gcloud builds submit --tag gcr.io/${{ secrets.GCP_PROJECT_ID }}/eco-footprint-app
        gcloud run deploy eco-footprint-app --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/eco-footprint-app --region us-central1 --allow-unauthenticated
```

## 🐛 Troubleshooting

### Common Issues:

1. **Build Fails**: Check your Dockerfile and dependencies
2. **Service Won't Start**: Verify environment variables
3. **403 Errors**: Check IAM permissions
4. **Memory Issues**: Increase memory allocation in Cloud Run

### Debug Commands:
```bash
# Check service status
gcloud run services describe eco-footprint-app --region us-central1

# View recent logs
gcloud logs tail "resource.type=cloud_run_revision"

# Test locally
docker run -p 8080:80 gcr.io/YOUR_PROJECT_ID/eco-footprint-app:latest
```

## 💰 Cost Optimization

1. **Set minimum instances to 0** for cost savings
2. **Use appropriate CPU and memory limits**
3. **Enable CPU throttling** when not serving requests
4. **Monitor usage** in Cloud Console

## 🎉 Success!

Once deployed, your app will be available at:
`https://eco-footprint-app-[hash]-uc.a.run.app`

The URL will be displayed after successful deployment.

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Google Cloud Run documentation
3. Check application logs for errors
4. Verify all environment variables are set correctly
