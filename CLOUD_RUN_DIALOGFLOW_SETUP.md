# 🚀 **Cloud Run + Dialogflow Integration Guide**

## 🎯 **Overview**

This guide shows you how to deploy your EcoCloudApp with integrated Dialogflow webhook to Google Cloud Run.

## 📋 **Prerequisites**

✅ **Google Cloud Project** with billing enabled  
✅ **Dialogflow ES Agent** created  
✅ **gcloud CLI** installed and authenticated  
✅ **Docker** installed (for local testing)  

## 🚀 **Deployment Steps**

### **Step 1: Prepare Your Environment**

```bash
# Authenticate with Google Cloud
gcloud auth login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable dialogflow.googleapis.com
```

### **Step 2: Deploy to Cloud Run**

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

**The script will:**
- ✅ Build your Docker image
- ✅ Push to Google Container Registry
- ✅ Deploy to Cloud Run with webhook endpoint
- ✅ Configure environment variables
- ✅ Provide webhook URL for Dialogflow

### **Step 3: Configure Dialogflow Console**

1. **Go to Dialogflow Console**: https://dialogflow.cloud.google.com/
2. **Select your project** or create a new agent
3. **Navigate to Fulfillment** in the left sidebar
4. **Enable Webhook**
5. **Enter Webhook URL**: `https://your-cloud-run-url.run.app/api/dialogflow-webhook`
6. **Click Save**

### **Step 4: Enable Webhook for Intents**

For each intent you want to handle with the webhook:

1. **Go to Intents** in Dialogflow Console
2. **Open the intent** (e.g., "Default Welcome Intent")
3. **Scroll to Fulfillment section**
4. **Check "Enable webhook call for this intent"**
5. **Save the intent**

**Recommended intents to enable:**
- ✅ Default Welcome Intent
- ✅ Get Carbon Footprint
- ✅ Add Carbon Entry
- ✅ Get Environmental Data
- ✅ Get Recommendations
- ✅ App Navigation Guide
- ✅ Carbon Facts Education
- ✅ Technical Support

---

## 🧪 **Testing Your Integration**

### **Test 1: Health Check**
```bash
curl https://your-cloud-run-url.run.app/health
```

### **Test 2: Webhook Endpoint**
```bash
curl -X POST https://your-cloud-run-url.run.app/api/dialogflow-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "responseId": "test",
    "queryResult": {
      "queryText": "hello",
      "action": "input.welcome",
      "parameters": {},
      "intent": {
        "name": "test",
        "displayName": "Welcome"
      }
    },
    "session": "test-session"
  }'
```

### **Test 3: Dialogflow Simulator**
1. Go to Dialogflow Console
2. Use the simulator on the right
3. Type "hello" and verify webhook response

### **Test 4: EcoCloudApp Chatbot**
1. Open your deployed EcoCloudApp
2. Open the chatbot
3. Type "hello" and verify dynamic response

---

## 🔧 **Environment Variables**

Your Cloud Run service needs these environment variables:

```bash
# Automatically set by deployment script
NODE_ENV=production
VITE_DIALOGFLOW_PROJECT_ID=your-project-id
VITE_GOOGLE_CLOUD_PROJECT_ID=your-project-id

# Set manually in Cloud Run console
VITE_FIREBASE_API_KEY=your-firebase-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_GEMINI_API_KEY=your-gemini-key
VITE_WEATHER_API_KEY=your-weather-key
VITE_GOOGLE_MAPS_API_KEY=your-maps-key
```

---

## 🔐 **Security Configuration**

### **Cloud Run Security**
```bash
# Deploy with specific service account (optional)
gcloud run deploy eco-footprint-app \
  --service-account=your-service-account@your-project.iam.gserviceaccount.com
```

### **Dialogflow Authentication**
- Cloud Run automatically handles authentication for Dialogflow
- No additional setup needed for webhook calls

---

## 📊 **Monitoring & Logs**

### **View Cloud Run Logs**
```bash
# View recent logs
gcloud logs read --service=eco-footprint-app --limit=50

# Stream live logs
gcloud logs tail --service=eco-footprint-app
```

### **Monitor Webhook Requests**
```bash
# Filter webhook logs
gcloud logs read --filter="resource.type=cloud_run_revision AND textPayload:webhook"
```

### **Dialogflow Logs**
1. Go to Google Cloud Console
2. Navigate to Logging
3. Filter by: `resource.type="dialogflow_agent"`

---

## 🐛 **Troubleshooting**

### **Common Issues:**

#### **Webhook URL Not Responding**
```bash
# Check Cloud Run service status
gcloud run services describe eco-footprint-app --region=us-central1

# Test webhook endpoint
curl https://your-url.run.app/api/dialogflow-webhook
```

#### **Dialogflow Not Calling Webhook**
1. ✅ Check webhook URL in Dialogflow Console
2. ✅ Ensure intents have webhook enabled
3. ✅ Verify Cloud Run service is running
4. ✅ Check Dialogflow logs for errors

#### **Environment Variables Missing**
```bash
# Update Cloud Run environment variables
gcloud run services update eco-footprint-app \
  --set-env-vars="VITE_FIREBASE_API_KEY=your-key" \
  --region=us-central1
```

#### **Memory/Timeout Issues**
```bash
# Increase memory and timeout
gcloud run services update eco-footprint-app \
  --memory=2Gi \
  --timeout=900 \
  --region=us-central1
```

---

## 🎉 **Success Indicators**

✅ **Cloud Run service is running**  
✅ **Health check returns 200 OK**  
✅ **Webhook endpoint responds to test requests**  
✅ **Dialogflow console shows webhook as connected**  
✅ **EcoCloudApp chatbot shows dynamic responses**  
✅ **Logs show successful webhook calls**  

---

## 🚀 **Next Steps**

Once your integration is working:

1. **Monitor Performance**: Set up Cloud Monitoring alerts
2. **Scale Configuration**: Adjust min/max instances based on usage
3. **Custom Domain**: Set up custom domain for your app
4. **CI/CD Pipeline**: Automate deployments with Cloud Build
5. **Enhanced Security**: Implement webhook authentication

---

## 📞 **Support**

If you encounter issues:

1. **Check logs**: `gcloud logs read --service=eco-footprint-app`
2. **Verify configuration**: Review Dialogflow webhook settings
3. **Test endpoints**: Use curl to test webhook directly
4. **Monitor metrics**: Check Cloud Run metrics in console

**Your EcoCloudApp with Dialogflow webhook is now ready for production!** 🌟🤖
