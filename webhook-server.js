// Simple Express.js server for Dialogflow webhook
// Run this separately from your React app

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.WEBHOOK_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Import your webhook handler (you'll need to build the TypeScript first)
// For now, we'll create a simple handler

// Simple webhook handler
app.post('/api/dialogflow-webhook', async (req, res) => {
  try {
    console.log('📨 Webhook request received:', {
      action: req.body.queryResult?.action,
      intent: req.body.queryResult?.intent?.displayName,
      queryText: req.body.queryResult?.queryText
    });

    const { queryResult } = req.body;
    const action = queryResult.action;
    const parameters = queryResult.parameters || {};
    const queryText = queryResult.queryText;

    let fulfillmentText = "I'm processing your request...";

    // Simple intent handling
    switch (action) {
      case 'input.welcome':
        fulfillmentText = "👋 Welcome to EcoCloudApp! I'm your AI assistant ready to help you track your carbon footprint and make sustainable choices. How can I assist you today?";
        break;

      case 'get.carbon.footprint':
        fulfillmentText = "📊 I'd love to show you your carbon footprint! However, I need to connect to your user data. Please make sure you're logged in to the app.";
        break;

      case 'get.recommendations':
        fulfillmentText = "💡 Here are some eco-friendly tips:\n\n🚶 Walk or bike for short trips\n💡 Use LED light bulbs\n🥬 Eat more plant-based meals\n♻️ Recycle and reduce waste\n\nWould you like specific tips for any category?";
        break;

      case 'get.environmental.data':
        fulfillmentText = "🌍 I can provide environmental data like air quality and weather information. This feature works best when connected to the main app with location services enabled.";
        break;

      default:
        fulfillmentText = "I understand you're asking about environmental topics. I can help with carbon footprint tracking, eco-friendly tips, environmental data, and app navigation. What would you like to know?";
    }

    // Send response back to Dialogflow
    res.json({
      fulfillmentText: fulfillmentText,
      fulfillmentMessages: [
        {
          text: {
            text: [fulfillmentText]
          }
        }
      ]
    });

    console.log('✅ Response sent:', fulfillmentText.substring(0, 50) + '...');

  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({
      fulfillmentText: "I'm sorry, I encountered an error. Please try again later."
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'EcoCloudApp Dialogflow Webhook'
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Webhook server is running!',
    endpoints: {
      webhook: '/api/dialogflow-webhook',
      health: '/health'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Dialogflow webhook server running on port ${PORT}`);
  console.log(`📡 Webhook URL: http://localhost:${PORT}/api/dialogflow-webhook`);
  console.log(`🔗 For ngrok: https://your-ngrok-url.ngrok.io/api/dialogflow-webhook`);
  console.log(`🧪 Test URL: http://localhost:${PORT}/test`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Webhook server shutting down...');
  process.exit(0);
});

module.exports = app;
