// Dialogflow Integration Service for EcoCloudApp
// Handles conversational AI interactions for carbon footprint tracking

import { v4 as uuidv4 } from 'uuid';

export interface DialogflowRequest {
  queryInput: {
    text: {
      text: string;
      languageCode: string;
    };
  };
  session: string;
}

export interface DialogflowResponse {
  queryResult: {
    queryText: string;
    action: string;
    parameters: Record<string, any>;
    fulfillmentText: string;
    intent: {
      name: string;
      displayName: string;
    };
  };
  responseId: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  action?: string;
  parameters?: Record<string, any>;
}

export interface ConversationSession {
  sessionId: string;
  userId: string;
  messages: ChatMessage[];
  context: Record<string, any>;
  createdAt: Date;
  lastActivity: Date;
}

class DialogflowService {
  private readonly PROJECT_ID = import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_ID || import.meta.env.VITE_DIALOGFLOW_PROJECT_ID || 'ecocloud-app';
  private readonly WEBHOOK_URL = import.meta.env.VITE_DIALOGFLOW_WEBHOOK_URL || window.location.origin + '/api/dialogflow-webhook';
  private sessions = new Map<string, ConversationSession>();

  // Create a new conversation session
  createSession(userId: string): string {
    const sessionId = uuidv4();
    const session: ConversationSession = {
      sessionId,
      userId,
      messages: [],
      context: {},
      createdAt: new Date(),
      lastActivity: new Date()
    };
    
    this.sessions.set(sessionId, session);
    console.log(`🤖 Created new Dialogflow session: ${sessionId} for user: ${userId}`);
    
    return sessionId;
  }

  // Get existing session or create new one
  getOrCreateSession(userId: string, sessionId?: string): string {
    if (sessionId && this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId)!;
      session.lastActivity = new Date();
      return sessionId;
    }
    
    return this.createSession(userId);
  }

  // Send message to Dialogflow and get response
  async sendMessage(
    sessionId: string,
    message: string,
    userId: string
  ): Promise<ChatMessage> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      // Add user message to session
      const userMessage: ChatMessage = {
        id: uuidv4(),
        text: message,
        sender: 'user',
        timestamp: new Date()
      };

      session.messages.push(userMessage);
      session.lastActivity = new Date();

      console.log(`🗣️ User message: ${message}`);

      // Try real Dialogflow API first, fallback to local processing
      let response: DialogflowResponse;

      try {
        response = await this.callDialogflowAPI(sessionId, message);
        console.log('✅ Using real Dialogflow API response');
      } catch (apiError) {
        console.warn('⚠️ Dialogflow API failed, using local processing:', apiError);

        // Fallback to local webhook processing
        const dialogflowRequest: DialogflowRequest = {
          queryInput: {
            text: {
              text: message,
              languageCode: 'en'
            }
          },
          session: `projects/${this.PROJECT_ID}/agent/sessions/${sessionId}`
        };

        response = await this.processWithWebhook(dialogflowRequest, userId);
      }
      
      // Create bot response message
      const botMessage: ChatMessage = {
        id: uuidv4(),
        text: response.queryResult.fulfillmentText,
        sender: 'bot',
        timestamp: new Date(),
        action: response.queryResult.action,
        parameters: response.queryResult.parameters
      };

      session.messages.push(botMessage);
      
      console.log(`🤖 Bot response: ${botMessage.text}`);
      
      return botMessage;
    } catch (error) {
      console.error('Error in Dialogflow service:', error);
      
      // Return error message
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        text: "I'm sorry, I'm having trouble processing your request right now. Please try again later. 🤖",
        sender: 'bot',
        timestamp: new Date()
      };      
      return errorMessage;
    }
  }

  // Call real Dialogflow API
  private async callDialogflowAPI(sessionId: string, message: string): Promise<DialogflowResponse> {
    const sessionPath = `projects/${this.PROJECT_ID}/agent/sessions/${sessionId}`;

    // Check if we have proper credentials
    if (!this.PROJECT_ID || this.PROJECT_ID === 'ecocloud-app') {
      throw new Error('Dialogflow project ID not configured');
    }

    // For client-side implementation, we need to use REST API
    const request = {
      queryInput: {
        text: {
          text: message,
          languageCode: 'en'
        }
      },
      session: sessionPath
    };

    // Note: In production, you'd need proper authentication
    // This is a simplified example - you'll need to set up proper auth
    const response = await fetch(`https://dialogflow.googleapis.com/v2/${sessionPath}:detectIntent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getAccessToken()}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Dialogflow API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      queryResult: {
        queryText: data.queryResult.queryText,
        action: data.queryResult.action || 'input.unknown',
        parameters: data.queryResult.parameters || {},
        fulfillmentText: data.queryResult.fulfillmentText,
        intent: {
          name: data.queryResult.intent?.name || 'unknown',
          displayName: data.queryResult.intent?.displayName || 'Unknown Intent'
        }
      },
      responseId: data.responseId
    };
  }

  // Get access token for Dialogflow API (simplified - needs proper implementation)
  private async getAccessToken(): Promise<string> {
    // In production, implement proper OAuth2 flow or use service account
    // For now, throw error to use fallback
    throw new Error('Access token not implemented - using fallback');
  }

  // Process message with webhook (simulates Dialogflow fulfillment)
  private async processWithWebhook(
    request: DialogflowRequest, 
    userId: string
  ): Promise<DialogflowResponse> {
    const queryText = request.queryInput.text.text.toLowerCase();
    
    // Simple intent matching (in production, Dialogflow would handle this)
    let action = 'input.unknown';
    let fulfillmentText = "🤔 I'd love to help you with that! Here are some things I can assist you with:\n\n**🌟 Popular Requests:**\n• \"What's my carbon footprint?\"\n• \"Give me reduction tips\"\n• \"Show me around the app\"\n• \"Tell me a carbon fact\"\n• \"How's the air quality?\"\n\n**💬 Or try asking:**\n• Questions about environmental data\n• Help with app features\n• Technical support\n\nWhat would you like to explore? 🌱";
    let parameters: Record<string, any> = {};
    let intentName = 'Default Fallback Intent';

    // Welcome intent - make it more flexible and comprehensive
    const lowerQuery = queryText.toLowerCase().trim();
    if (lowerQuery === 'hello' ||
        lowerQuery === 'hi' ||
        lowerQuery === 'hey' ||
        lowerQuery === 'start' ||
        lowerQuery === 'begin' ||
        lowerQuery.includes('hello') ||
        lowerQuery.includes('hi there') ||
        lowerQuery.includes('good morning') ||
        lowerQuery.includes('good afternoon') ||
        lowerQuery.includes('good evening') ||
        lowerQuery.includes('greetings')) {
      action = 'input.welcome';
      intentName = 'Default Welcome Intent';
      fulfillmentText = "👋 **Welcome to EcoCloudApp AI Assistant**\n\nI'm your intelligent environmental companion, ready to help you achieve your sustainability goals!\n\n**🎯 How I can assist you:**\n\n🧮 **Smart Carbon Analysis** - Track your footprint\n🌍 **Environmental Data** - Live updates\n💡 **AI Recommendations** - Personalized tips\n🧭 **App Navigation** - Expert guidance\n📚 **Educational Content** - Learn & grow\n🔧 **Technical Support** - Instant help\n\n*What would you like to explore first?* ✨";
    }
    
    // Carbon footprint queries - more flexible matching
    else if (lowerQuery.includes('carbon footprint') ||
             lowerQuery.includes('carbon') ||
             lowerQuery.includes('footprint') ||
             lowerQuery.includes('emissions') ||
             lowerQuery.includes('co2') ||
             lowerQuery.includes('my impact') ||
             lowerQuery.includes('environmental impact')) {
      action = 'get.carbon.footprint';
      intentName = 'Get Carbon Footprint';
      
      // Extract time period
      if (queryText.includes('today')) parameters.time_period = 'today';
      else if (queryText.includes('week')) parameters.time_period = 'this week';
      else if (queryText.includes('month')) parameters.time_period = 'this month';
      else if (queryText.includes('year')) parameters.time_period = 'this year';
      else parameters.time_period = 'this month';
      
      // Extract category
      if (queryText.includes('transport') || queryText.includes('travel') || queryText.includes('car') || queryText.includes('driving')) {
        parameters.category = 'transport';
      } else if (queryText.includes('energy') || queryText.includes('electricity') || queryText.includes('power')) {
        parameters.category = 'energy';
      } else if (queryText.includes('food') || queryText.includes('diet')) {
        parameters.category = 'food';
      } else if (queryText.includes('waste') || queryText.includes('trash')) {
        parameters.category = 'waste';
      }
      
      fulfillmentText = "Let me get your carbon footprint data! 📊";
    }
    
    // Add carbon entry
    else if (queryText.includes('track') || queryText.includes('add') || queryText.includes('log') || queryText.includes('drove') || queryText.includes('used')) {
      action = 'add.carbon.entry';
      intentName = 'Add Carbon Entry';
      
      // Extract category
      if (queryText.includes('transport') || queryText.includes('drove') || queryText.includes('car') || queryText.includes('km') || queryText.includes('miles')) {
        parameters.category = 'transport';
      } else if (queryText.includes('energy') || queryText.includes('electricity') || queryText.includes('kwh')) {
        parameters.category = 'energy';
      } else if (queryText.includes('food') || queryText.includes('ate') || queryText.includes('meal')) {
        parameters.category = 'food';
      } else if (queryText.includes('waste') || queryText.includes('trash') || queryText.includes('recycl')) {
        parameters.category = 'waste';
      }
      
      // Extract numbers (amount)
      const numberMatch = queryText.match(/\d+/);
      if (numberMatch) {
        parameters.amount = parseInt(numberMatch[0]);
      }
      
      fulfillmentText = "I'll help you add a carbon footprint entry! 📝";
    }
    
    // Environmental data queries
    else if (queryText.includes('air quality') || queryText.includes('weather') || queryText.includes('environment') || queryText.includes('carbon intensity')) {
      action = 'get.environmental.data';
      intentName = 'Get Environmental Data';
      
      if (queryText.includes('air quality')) parameters.data_type = 'air_quality';
      else if (queryText.includes('weather')) parameters.data_type = 'weather';
      else if (queryText.includes('carbon intensity')) parameters.data_type = 'carbon_intensity';
      
      fulfillmentText = "Let me get the latest environmental data for you! 🌍";
    }
    
    // Recommendations - more flexible matching
    else if (lowerQuery.includes('reduce') ||
             lowerQuery.includes('tips') ||
             lowerQuery.includes('recommend') ||
             lowerQuery.includes('eco-friendly') ||
             lowerQuery.includes('green') ||
             lowerQuery.includes('sustainable') ||
             lowerQuery.includes('help me') ||
             lowerQuery.includes('suggestions') ||
             lowerQuery.includes('advice')) {
      action = 'get.recommendations';
      intentName = 'Get Recommendations';
      
      // Extract category for specific recommendations
      if (queryText.includes('transport') || queryText.includes('travel') || queryText.includes('driving')) {
        parameters.category = 'transport';
      } else if (queryText.includes('energy') || queryText.includes('electricity')) {
        parameters.category = 'energy';
      } else if (queryText.includes('food') || queryText.includes('diet')) {
        parameters.category = 'food';
      } else if (queryText.includes('waste')) {
        parameters.category = 'waste';
      }
      
      fulfillmentText = "I'll provide you with personalized recommendations to reduce your environmental impact! 💡";
    }
    
    // App navigation and guidance - more flexible matching
    else if (lowerQuery.includes('how do i use') ||
             lowerQuery.includes('show me around') ||
             lowerQuery.includes('guide me') ||
             lowerQuery.includes('tour') ||
             lowerQuery.includes('app tour') ||
             lowerQuery.includes('show me') ||
             lowerQuery.includes('navigate') ||
             (lowerQuery.includes('how does') && lowerQuery.includes('work'))) {
      action = 'app.navigation.guide';
      intentName = 'App Navigation Guide';

      // Extract feature name
      const features = ['calculator', 'reports', 'gamification', 'profile', 'suggestions'];
      const mentionedFeature = features.find(feature => queryText.includes(feature));
      if (mentionedFeature) {
        parameters.feature_name = mentionedFeature;
      }

      fulfillmentText = "I'll help you navigate the app! 🧭";
    }

    // Carbon facts and education
    else if (queryText.includes('fact') || queryText.includes('teach me') ||
             queryText.includes('why does') || queryText.includes('interesting') ||
             queryText.includes('did you know') || queryText.includes('learn about')) {
      action = 'education.carbon.facts';
      intentName = 'Carbon Facts Education';

      // Extract category if mentioned
      const categories = ['transport', 'energy', 'food', 'waste'];
      const mentionedCategory = categories.find(cat => queryText.includes(cat));
      if (mentionedCategory) {
        parameters.fact_category = mentionedCategory;
      }

      fulfillmentText = "Let me share an interesting carbon fact with you! 🌱";
    }

    // Technical support
    else if (queryText.includes('problem') || queryText.includes('issue') ||
             queryText.includes('not working') || queryText.includes('broken') ||
             queryText.includes('trouble') || queryText.includes('help') &&
             (queryText.includes('fix') || queryText.includes('support'))) {
      action = 'support.technical.help';
      intentName = 'Technical Support';

      // Extract issue type
      if (queryText.includes('login')) parameters.issue_type = 'login';
      else if (queryText.includes('saving') || queryText.includes('save')) parameters.issue_type = 'data not saving';
      else if (queryText.includes('loading') || queryText.includes('load')) parameters.issue_type = 'not loading';

      // Extract affected feature
      const features = ['calculator', 'reports', 'gamification', 'profile'];
      const affectedFeature = features.find(feature => queryText.includes(feature));
      if (affectedFeature) {
        parameters.feature_affected = affectedFeature;
      }

      fulfillmentText = "I'm here to help you troubleshoot! Let me guide you through some solutions. 🔧";
    }

    // Feature discovery
    else if (queryText.includes('what can') || queryText.includes('features') ||
             queryText.includes('new here') || queryText.includes('get started') ||
             queryText.includes('what should i do') || queryText.includes('recommend')) {
      action = 'app.feature.discovery';
      intentName = 'Feature Discovery';

      // Extract user goal
      if (queryText.includes('track progress')) parameters.user_goal = 'track progress';
      else if (queryText.includes('reduce') || queryText.includes('lower')) parameters.user_goal = 'reduce emissions';
      else if (queryText.includes('motivated') || queryText.includes('points')) parameters.user_goal = 'stay motivated';
      else if (queryText.includes('started') || queryText.includes('begin')) parameters.user_goal = 'get started';

      fulfillmentText = "Let me help you discover the perfect features for your needs! 🔍";
    }

    // How are you (small talk)
    else if (queryText.includes('how are you') || queryText.includes('how\'s it going')) {
      action = 'smalltalk.how.are.you';
      intentName = 'Small Talk - How are you';
      fulfillmentText = "I'm doing great! I'm excited to help you track your environmental impact and make a positive difference for our planet! 🌱 How can I assist you with your carbon footprint today?";
    }

    return {
      queryResult: {
        queryText: request.queryInput.text.text,
        action,
        parameters,
        fulfillmentText,
        intent: {
          name: `projects/${this.PROJECT_ID}/agent/intents/${intentName.toLowerCase().replace(/\s+/g, '-')}`,
          displayName: intentName
        }
      },
      responseId: uuidv4()
    };
  }

  // Get conversation history
  getConversationHistory(sessionId: string): ChatMessage[] {
    const session = this.sessions.get(sessionId);
    return session ? session.messages : [];
  }

  // Clear session
  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    console.log(`🗑️ Cleared Dialogflow session: ${sessionId}`);
  }

  // Get all active sessions for a user
  getUserSessions(userId: string): ConversationSession[] {
    return Array.from(this.sessions.values()).filter(session => session.userId === userId);
  }

  // Clean up old sessions (older than 24 hours)
  cleanupOldSessions(): void {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.lastActivity < oneDayAgo) {
        this.sessions.delete(sessionId);
        console.log(`🧹 Cleaned up old session: ${sessionId}`);
      }
    }
  }
}

export const dialogflowService = new DialogflowService();

// Clean up old sessions every hour
setInterval(() => {
  dialogflowService.cleanupOldSessions();
}, 60 * 60 * 1000);
