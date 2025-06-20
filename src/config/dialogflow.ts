// Dialogflow Configuration for EcoCloudApp
// Centralized configuration for Dialogflow ES integration

export interface DialogflowConfig {
  projectId: string;
  languageCode: string;
  sessionTimeout: number; // in minutes
  webhookUrl: string;
  enableWebhook: boolean;
  enableSmallTalk: boolean;
  maxMessageLength: number;
  typingDelay: number; // in milliseconds
  retryAttempts: number;
  retryDelay: number; // in milliseconds
}

export const dialogflowConfig: DialogflowConfig = {
  // Google Cloud Project ID for Dialogflow
  projectId: import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_ID || 'ecofootprint-6ac62',
  
  // Default language for conversations
  languageCode: 'en',
  
  // Session timeout in minutes (30 minutes default)
  sessionTimeout: 30,
  
  // Webhook URL for fulfillment
  webhookUrl: import.meta.env.VITE_DIALOGFLOW_WEBHOOK_URL || '/api/dialogflow-webhook',
  
  // Enable webhook fulfillment
  enableWebhook: true,
  
  // Enable small talk capabilities
  enableSmallTalk: true,
  
  // Maximum message length
  maxMessageLength: 1000,
  
  // Typing delay for better UX (milliseconds)
  typingDelay: 1000,
  
  // Retry configuration
  retryAttempts: 3,
  retryDelay: 1000
};

// Intent action mappings
export const intentActions = {
  WELCOME: 'input.welcome',
  GET_CARBON_FOOTPRINT: 'get.carbon.footprint',
  ADD_CARBON_ENTRY: 'add.carbon.entry',
  GET_ENVIRONMENTAL_DATA: 'get.environmental.data',
  GET_RECOMMENDATIONS: 'get.recommendations',
  GET_REPORTS: 'get.reports',
  GET_ACHIEVEMENTS: 'get.achievements',
  APP_NAVIGATION_GUIDE: 'app.navigation.guide',
  EDUCATION_CARBON_FACTS: 'education.carbon.facts',
  SUPPORT_TECHNICAL_HELP: 'support.technical.help',
  APP_FEATURE_DISCOVERY: 'app.feature.discovery',
  SMALL_TALK_HOW_ARE_YOU: 'smalltalk.how.are.you',
  UNKNOWN: 'input.unknown'
} as const;

// Entity type mappings
export const entityTypes = {
  CARBON_CATEGORIES: '@carbon_categories',
  TIME_PERIODS: '@time_periods',
  SYS_NUMBER: '@sys.number',
  SYS_ANY: '@sys.any'
} as const;

// Carbon category mappings
export const carbonCategories = {
  TRANSPORT: 'transport',
  ENERGY: 'energy',
  FOOD: 'food',
  WASTE: 'waste'
} as const;

// Time period mappings
export const timePeriods = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  THIS_WEEK: 'this week',
  LAST_WEEK: 'last week',
  THIS_MONTH: 'this month',
  LAST_MONTH: 'last month',
  THIS_YEAR: 'this year',
  ALL_TIME: 'all time'
} as const;

// Quick reply suggestions for different contexts
export const quickReplies = {
  welcome: [
    "What's my carbon footprint?",
    "How's the air quality?",
    "Give me eco tips",
    "Show me around the app"
  ],
  carbonFootprint: [
    "Show this week's data",
    "Transport emissions only",
    "Compare to last month",
    "Generate my report"
  ],
  addEntry: [
    "I drove 25 km",
    "Used 15 kWh electricity",
    "Ate 0.5 kg beef",
    "Threw away 2 kg trash"
  ],
  recommendations: [
    "Transport tips",
    "Energy saving tips",
    "Food recommendations",
    "Waste reduction tips"
  ],
  environmental: [
    "Air quality update",
    "Weather conditions",
    "Carbon intensity",
    "Tell me a carbon fact"
  ],
  appGuide: [
    "How do I use the calculator?",
    "Show me the reports feature",
    "What's gamification?",
    "Take me to my profile"
  ],
  support: [
    "I can't log in",
    "My data isn't saving",
    "The app isn't loading",
    "Contact support"
  ],
  discovery: [
    "What features are available?",
    "I'm new here",
    "What should I do next?",
    "Recommend features for me"
  ]
};

// Response templates for different scenarios
export const responseTemplates = {
  noData: "You haven't tracked any {category} emissions yet! Start by telling me about your activities like '{example}'.",
  dataFound: "Your {category} emissions {timePeriod}: {amount} kg CO₂ from {count} activities.",
  entryAdded: "✅ Added {amount} {unit} of {activity}!\n\nEmissions: {co2} kg CO₂\nGreen Points: {points} 🌱",
  error: "I'm sorry, I encountered an error while processing your request. Please try again later. 🤖",
  clarification: "I need more information. Could you please specify {missing}?",
  encouragement: "Great job tracking your environmental impact! Keep it up! 🌱"
};

// Validation rules
export const validationRules = {
  maxCarbonAmount: 10000, // kg CO2
  minCarbonAmount: 0.01,
  maxActivityAmount: 100000,
  minActivityAmount: 0.01,
  maxMessageLength: 1000,
  minMessageLength: 1
};

// Feature flags
export const featureFlags = {
  enableVoiceInput: false,
  enableImageUpload: false,
  enableLocationTracking: true,
  enablePushNotifications: false,
  enableAnalytics: true,
  enableMultiLanguage: false,
  enableOfflineMode: false
};

// Analytics events
export const analyticsEvents = {
  CONVERSATION_STARTED: 'conversation_started',
  MESSAGE_SENT: 'message_sent',
  INTENT_MATCHED: 'intent_matched',
  WEBHOOK_CALLED: 'webhook_called',
  CARBON_ENTRY_ADDED: 'carbon_entry_added',
  RECOMMENDATIONS_REQUESTED: 'recommendations_requested',
  ENVIRONMENTAL_DATA_REQUESTED: 'environmental_data_requested',
  ERROR_OCCURRED: 'error_occurred'
};

// Helper functions
export const getSessionPath = (projectId: string, sessionId: string): string => {
  return `projects/${projectId}/agent/sessions/${sessionId}`;
};

export const getIntentPath = (projectId: string, intentId: string): string => {
  return `projects/${projectId}/agent/intents/${intentId}`;
};

export const getEntityTypePath = (projectId: string, entityTypeId: string): string => {
  return `projects/${projectId}/agent/entityTypes/${entityTypeId}`;
};

export const isValidCarbonAmount = (amount: number): boolean => {
  return amount >= validationRules.minCarbonAmount && amount <= validationRules.maxCarbonAmount;
};

export const isValidActivityAmount = (amount: number): boolean => {
  return amount >= validationRules.minActivityAmount && amount <= validationRules.maxActivityAmount;
};

export const isValidMessage = (message: string): boolean => {
  return message.length >= validationRules.minMessageLength && 
         message.length <= validationRules.maxMessageLength;
};

export default dialogflowConfig;
