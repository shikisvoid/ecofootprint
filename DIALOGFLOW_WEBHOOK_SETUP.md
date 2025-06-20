# 🤖 Dialogflow Webhook Setup Guide

## 🎯 **Overview**

This guide will help you connect your EcoCloudApp chatbot to real Dialogflow ES with a working webhook.

## 🚀 **Quick Setup (3 Methods)**

### **Method 1: Local Development with ngrok (Recommended for Testing)**

#### **Step 1: Install Dependencies**
```bash
# Install webhook server dependencies
npm install express cors

# Install ngrok globally
npm install -g ngrok
```

#### **Step 2: Start Webhook Server**
```bash
# Copy the webhook package.json
cp webhook-package.json package-webhook.json

# Install dependencies
npm install --prefix . express cors

# Start the webhook server
node webhook-server.js
```

#### **Step 3: Expose with ngrok**
```bash
# In a new terminal, expose your webhook
ngrok http 3001
```

**Copy the HTTPS URL from ngrok (e.g., `https://abc123.ngrok.io`)**

#### **Step 4: Configure Dialogflow**
1. Go to [Dialogflow Console](https://dialogflow.cloud.google.com/)
2. Select your project or create new one
3. Go to **Fulfillment** in the left sidebar
4. Enable **Webhook**
5. Enter your webhook URL: `https://your-ngrok-url.ngrok.io/api/dialogflow-webhook`
6. Click **Save**

#### **Step 5: Enable Webhook for Intents**
1. Go to **Intents** in Dialogflow Console
2. For each intent you want to handle:
   - Open the intent
   - Scroll to **Fulfillment**
   - Check **Enable webhook call for this intent**
   - Save

---

### **Method 2: Deploy to Google Cloud Run**

#### **Step 1: Prepare for Deployment**
```bash
# Create Dockerfile for webhook
cat > Dockerfile.webhook << EOF
FROM node:18-alpine
WORKDIR /app
COPY webhook-server.js .
COPY webhook-package.json package.json
RUN npm install
EXPOSE 3001
CMD ["npm", "start"]
EOF
```

#### **Step 2: Deploy to Cloud Run**
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/dialogflow-webhook
gcloud run deploy dialogflow-webhook \
  --image gcr.io/YOUR_PROJECT_ID/dialogflow-webhook \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### **Step 3: Configure Dialogflow**
Use the Cloud Run URL in Dialogflow webhook settings.

---

### **Method 3: Integrate with Existing App**

#### **Step 1: Add Webhook Route to Your App**
```typescript
// Add to your main app server (if using Express)
import { dialogflowWebhookServer } from './src/services/dialogflowWebhookServer';

app.post('/api/dialogflow-webhook', dialogflowWebhookServer.createExpressMiddleware());
```

#### **Step 2: Update Environment Variables**
```bash
# Add to your .env file
VITE_DIALOGFLOW_WEBHOOK_URL=https://your-app-domain.com/api/dialogflow-webhook
```

---

## 🔧 **Testing Your Webhook**

### **Test 1: Webhook Server Health**
```bash
curl http://localhost:3001/health
```

### **Test 2: Webhook Functionality**
```bash
curl -X POST http://localhost:3001/api/dialogflow-webhook \
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

### **Test 3: Dialogflow Integration**
1. Go to Dialogflow Console
2. Use the **Simulator** on the right
3. Type "hello" and check if you get the webhook response

---

## 🎯 **Dialogflow Console Configuration**

### **Required Intents to Create:**

1. **Default Welcome Intent**
   - Training phrases: "hello", "hi", "hey", "start"
   - Enable webhook fulfillment

2. **Get Carbon Footprint**
   - Training phrases: "what's my carbon footprint", "show my emissions"
   - Enable webhook fulfillment

3. **Get Recommendations**
   - Training phrases: "give me tips", "how to reduce emissions"
   - Enable webhook fulfillment

4. **Get Environmental Data**
   - Training phrases: "air quality", "weather", "environmental data"
   - Enable webhook fulfillment

### **Webhook Configuration:**
- **URL**: Your ngrok or deployed webhook URL
- **Headers**: None required for basic setup
- **Authentication**: None for development

---

## 🔐 **Production Security**

### **For Production Deployment:**

1. **Enable Authentication**
```javascript
// Add to webhook-server.js
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

app.use('/api/dialogflow-webhook', (req, res, next) => {
  const signature = req.headers['x-webhook-signature'];
  // Verify signature
  next();
});
```

2. **Environment Variables**
```bash
WEBHOOK_SECRET=your-secret-key
DIALOGFLOW_PROJECT_ID=your-project-id
```

3. **HTTPS Only**
- Always use HTTPS in production
- Dialogflow requires HTTPS for webhooks

---

## 🐛 **Troubleshooting**

### **Common Issues:**

#### **Webhook Not Responding**
```bash
# Check if server is running
curl http://localhost:3001/health

# Check ngrok tunnel
curl https://your-ngrok-url.ngrok.io/health
```

#### **Dialogflow Not Calling Webhook**
1. Check webhook URL in Dialogflow Console
2. Ensure intents have webhook enabled
3. Check Dialogflow logs in Google Cloud Console

#### **CORS Issues**
```javascript
// Add to webhook-server.js
app.use(cors({
  origin: ['https://console.dialogflow.com', 'https://your-app-domain.com'],
  credentials: true
}));
```

#### **Timeout Issues**
```javascript
// Increase timeout in webhook-server.js
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

---

## 📊 **Monitoring & Logs**

### **View Webhook Logs**
```bash
# Local development
tail -f webhook-server.log

# Google Cloud Run
gcloud logs read --service=dialogflow-webhook
```

### **Dialogflow Logs**
1. Go to Google Cloud Console
2. Navigate to Logging
3. Filter by Dialogflow service

---

## 🎉 **Success Indicators**

✅ **Webhook server responds to health checks**  
✅ **ngrok tunnel is active and accessible**  
✅ **Dialogflow console shows webhook URL as valid**  
✅ **Test messages in Dialogflow simulator get webhook responses**  
✅ **Your EcoCloudApp chatbot shows dynamic responses**

---

## 🚀 **Next Steps**

Once your webhook is working:

1. **Enhance Responses**: Add more dynamic data integration
2. **Add Rich Responses**: Cards, quick replies, images
3. **Implement Authentication**: Secure your webhook
4. **Add Analytics**: Track webhook performance
5. **Scale**: Deploy to production environment

**Your Dialogflow webhook should now be fully functional!** 🌟
