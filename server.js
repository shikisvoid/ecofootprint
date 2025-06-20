// Express server for EcoCloudApp with Dialogflow webhook
// This serves both the React app and handles Dialogflow webhooks

import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080; // Cloud Run uses PORT env variable

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the React app build
app.use(express.static(path.join(__dirname, 'dist')));

// Dialogflow webhook endpoint
app.post('/api/dialogflow-webhook', async (req, res) => {
  try {
    console.log('📨 Dialogflow webhook request:', {
      action: req.body.queryResult?.action,
      intent: req.body.queryResult?.intent?.displayName,
      queryText: req.body.queryResult?.queryText,
      session: req.body.session
    });

    const { queryResult } = req.body;
    const action = queryResult.action || 'input.unknown';
    const parameters = queryResult.parameters || {};
    const queryText = queryResult.queryText || '';

    // Extract user ID from session if available
    const sessionPath = req.body.session || '';
    const userId = extractUserIdFromSession(sessionPath) || 'anonymous';

    let fulfillmentText = '';
    let fulfillmentMessages = [];

    // Handle different intents
    switch (action) {
      case 'input.welcome':
        fulfillmentText = "👋 **Welcome to EcoCloudApp AI Assistant**\n\nI'm your intelligent environmental companion, ready to help you achieve your sustainability goals!\n\n**🎯 How I can assist you:**\n\n🧮 **Smart Carbon Analysis** - Track your footprint\n🌍 **Environmental Data** - Live updates\n💡 **AI Recommendations** - Personalized tips\n🧭 **App Navigation** - Expert guidance\n📚 **Educational Content** - Learn & grow\n🔧 **Technical Support** - Instant help\n\n*What would you like to explore first?* ✨";
        break;

      case 'get.carbon.footprint':
        fulfillmentText = await handleCarbonFootprintQuery(parameters, userId);
        break;

      case 'add.carbon.entry':
        fulfillmentText = await handleAddCarbonEntry(parameters, userId);
        break;

      case 'get.environmental.data':
        fulfillmentText = await handleEnvironmentalData(parameters, userId);
        break;

      case 'get.recommendations':
        fulfillmentText = getRecommendations(parameters);
        break;

      case 'app.navigation.guide':
        fulfillmentText = getNavigationGuide(parameters);
        break;

      case 'education.carbon.facts':
        fulfillmentText = getCarbonFacts(parameters);
        break;

      case 'support.technical.help':
        fulfillmentText = getTechnicalSupport(parameters);
        break;

      case 'app.feature.discovery':
        fulfillmentText = getFeatureDiscovery(parameters);
        break;

      case 'smalltalk.how.are.you':
        fulfillmentText = "I'm doing great! I'm excited to help you track your environmental impact and make a positive difference for our planet! 🌱 How can I assist you with your carbon footprint today?";
        break;

      default:
        fulfillmentText = "🤔 I'd love to help you with that! Here are some things I can assist you with:\n\n**🌟 Popular Requests:**\n• \"What's my carbon footprint?\"\n• \"Give me reduction tips\"\n• \"Show me around the app\"\n• \"Tell me a carbon fact\"\n• \"How's the air quality?\"\n\n**💬 Or try asking:**\n• Questions about environmental data\n• Help with app features\n• Technical support\n\nWhat would you like to explore? 🌱";
    }

    // Create fulfillment messages
    fulfillmentMessages = [
      {
        text: {
          text: [fulfillmentText]
        }
      }
    ];

    // Send response back to Dialogflow
    const response = {
      fulfillmentText: fulfillmentText,
      fulfillmentMessages: fulfillmentMessages
    };

    console.log('✅ Webhook response sent:', fulfillmentText.substring(0, 100) + '...');
    res.json(response);

  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({
      fulfillmentText: "I'm sorry, I encountered an error while processing your request. Please try again later. 🤖"
    });
  }
});

// Health check endpoint for Cloud Run
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'EcoCloudApp with Dialogflow',
    version: '1.0.0'
  });
});

// API test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'EcoCloudApp API is running!',
    endpoints: {
      webhook: '/api/dialogflow-webhook',
      health: '/health',
      app: '/'
    },
    timestamp: new Date().toISOString()
  });
});

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Helper functions
function extractUserIdFromSession(sessionPath) {
  try {
    // Extract session ID from path like: projects/PROJECT_ID/agent/sessions/SESSION_ID
    const sessionId = sessionPath.split('/').pop();
    
    // If session ID contains user info (format: userId_timestamp)
    if (sessionId && sessionId.includes('_')) {
      return sessionId.split('_')[0];
    }
    
    return null;
  } catch (error) {
    console.warn('Could not extract user ID from session:', error);
    return null;
  }
}

async function handleCarbonFootprintQuery(parameters, userId) {
  // In a real implementation, you'd fetch from Firebase here
  // For now, return a helpful message
  const timePeriod = parameters.time_period || 'this month';
  
  return `📊 I'd love to show you your carbon footprint for ${timePeriod}! \n\nTo get your real data, please:\n1. Make sure you're logged into the EcoCloudApp\n2. Have tracked some activities in the Carbon Calculator\n3. Try asking again from within the app\n\n🌱 If you haven't started tracking yet, visit the Calculator section to log your daily activities!`;
}

async function handleAddCarbonEntry(parameters, userId) {
  const category = parameters.category;
  const amount = parameters.amount;
  
  if (!category) {
    return "What category would you like to track? I can help with:\n🚗 **Transport** - driving, public transport\n⚡ **Energy** - electricity, heating\n🍽️ **Food** - meals, groceries\n🗑️ **Waste** - trash, recycling";
  }
  
  if (!amount) {
    return `Great! I'll help you track ${category} emissions. Please tell me the amount:\n• Transport: "I drove 25 km"\n• Energy: "I used 15 kWh"\n• Food: "I ate 0.5 kg of beef"\n• Waste: "I threw away 2 kg of trash"`;
  }
  
  return `✅ I'd love to add ${amount} ${getUnitForCategory(category)} of ${category} to your tracking!\n\n📱 To save this entry to your account:\n1. Open the EcoCloudApp\n2. Go to the Carbon Calculator\n3. Add this entry there\n\nThis will ensure it's saved to your personal tracking data! 🌱`;
}

async function handleEnvironmentalData(parameters, userId) {
  const dataType = parameters.data_type;
  
  if (dataType === 'air_quality') {
    return "🌬️ **Air Quality Information**\n\nI can provide real-time air quality data! For the most accurate information for your location:\n\n1. Open the EcoCloudApp\n2. Allow location access\n3. Check the Environmental Data section\n\nThis will show you live AQI, PM2.5, and other air quality metrics for your area! 🌍";
  }
  
  if (dataType === 'weather') {
    return "🌤️ **Weather Information**\n\nI can provide current weather conditions! For real-time weather data:\n\n1. Visit the Environmental Data section in EcoCloudApp\n2. Allow location access for accurate local weather\n3. Get temperature, humidity, wind, and UV index\n\nStay informed about conditions that affect your eco-friendly choices! ☀️";
  }
  
  return "🌍 **Environmental Data Available:**\n\n🌬️ **Air Quality** - AQI, PM2.5, pollution levels\n🌤️ **Weather** - Temperature, humidity, conditions\n⚡ **Carbon Intensity** - Grid electricity emissions\n\nFor real-time data, visit the Environmental Data section in the EcoCloudApp! 📊";
}

function getRecommendations(parameters) {
  const category = parameters.category;
  
  const recommendations = {
    transport: [
      "🚶 Walk or bike for trips under 2 km",
      "🚌 Use public transportation when possible",
      "🚗 Carpool or use ride-sharing services",
      "⚡ Consider electric or hybrid vehicles",
      "🏠 Work from home to reduce commuting"
    ],
    energy: [
      "💡 Switch to LED light bulbs (75% less energy)",
      "🌡️ Adjust thermostat by 2-3 degrees",
      "🔌 Unplug electronics when not in use",
      "☀️ Use natural light during the day",
      "⚡ Consider renewable energy sources"
    ],
    food: [
      "🥬 Eat more plant-based meals",
      "🥩 Reduce red meat consumption",
      "🛒 Buy local and seasonal produce",
      "🗑️ Reduce food waste by meal planning",
      "♻️ Compost organic waste"
    ],
    waste: [
      "♻️ Recycle paper, plastic, and glass",
      "🗑️ Reduce single-use items",
      "🛍️ Use reusable bags and containers",
      "🔄 Buy products with minimal packaging",
      "🌱 Compost organic waste"
    ]
  };

  if (category && recommendations[category]) {
    return `💡 **${category.charAt(0).toUpperCase() + category.slice(1)} Reduction Tips:**\n\n${recommendations[category].join('\n')}\n\n🌱 Start tracking these activities in the EcoCloudApp to see your impact!`;
  }

  return "💡 **General Eco-Friendly Tips:**\n\n🚶 Choose walking, biking, or public transport\n💡 Use energy-efficient appliances and LED lighting\n🥬 Eat more plant-based meals\n♻️ Recycle and reduce waste\n🌱 Track your activities to monitor progress!\n\nWant specific tips? Ask about transport, energy, food, or waste! 🌍";
}

function getNavigationGuide(parameters) {
  return "🧭 **EcoCloudApp Navigation Guide:**\n\n🧮 **Carbon Calculator** - Track daily emissions\n📊 **Reports** - View your progress over time\n🏆 **Gamification** - Earn points and badges\n💡 **AI Suggestions** - Get personalized advice\n👤 **Profile** - Set goals and preferences\n🌍 **Environmental Data** - Real-time air quality\n\n**Need specific help?** Try asking:\n• \"How do I use the calculator?\"\n• \"Show me the reports section\"\n• \"How do I earn points?\"\n\nI'm here to guide you! 🚀";
}

function getCarbonFacts(parameters) {
  const facts = [
    "🌍 If everyone lived like the average American, we'd need 5 Earths!",
    "🌳 One mature tree absorbs 48 lbs of CO₂ per year",
    "🚗 The average car emits 4.6 metric tons of CO₂ annually",
    "💡 LED bulbs use 75% less energy than incandescent bulbs",
    "🥩 Beef production generates 60kg of CO₂ per kg of meat",
    "♻️ Recycling one aluminum can saves enough energy to power a TV for 3 hours"
  ];
  
  const randomFact = facts[Math.floor(Math.random() * facts.length)];
  return `🌱 **Interesting Carbon Fact:**\n\n${randomFact}\n\n💡 Want to learn more? Ask me about specific categories like transport, energy, food, or waste!`;
}

function getTechnicalSupport(parameters) {
  return "🔧 **Technical Support:**\n\nI can help with:\n• **Login issues** - \"I can't log in\"\n• **Data not saving** - \"My entries aren't saving\"\n• **Features not loading** - \"The calculator won't load\"\n• **General app problems** - \"Something is broken\"\n\n**Quick fixes to try:**\n1. Refresh the page (Ctrl+F5)\n2. Clear browser cache\n3. Check internet connection\n4. Try incognito/private mode\n\nDescribe your specific issue and I'll provide detailed troubleshooting steps! 🛠️";
}

function getFeatureDiscovery(parameters) {
  return "🔍 **Discover EcoCloudApp Features:**\n\n🆕 **New here?** Start with:\n• **Carbon Calculator** - Track your first activity\n• **Profile Settings** - Set your environmental goals\n\n📊 **Track Progress:**\n• **Reports** - View charts and trends\n• **Gamification** - Earn points and badges\n\n💡 **Get Smarter:**\n• **AI Suggestions** - Personalized eco advice\n• **Environmental Data** - Live air quality & weather\n\n**What interests you most?** I can guide you through any feature step-by-step! 🚀";
}

function getUnitForCategory(category) {
  const units = {
    transport: 'km',
    energy: 'kWh', 
    food: 'kg',
    waste: 'kg'
  };
  return units[category] || 'units';
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 EcoCloudApp server running on port ${PORT}`);
  console.log(`📡 Webhook endpoint: /api/dialogflow-webhook`);
  console.log(`🔗 Health check: /health`);
  console.log(`🌐 App URL: http://localhost:${PORT}`);
});

export default app;
