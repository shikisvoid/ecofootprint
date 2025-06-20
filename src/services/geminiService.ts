import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

console.log('Gemini API Key loaded:', API_KEY ? 'Yes' : 'No');
console.log('API Key length:', API_KEY?.length || 0);

if (!API_KEY) {
  console.error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export interface EcoSuggestion {
  id: string;
  query: string;
  response: string;
  category: string;
  timestamp: string;
  impact: 'low' | 'medium' | 'high';
  actionItems: string[];
  estimatedCO2Reduction?: number;
}

export const geminiService = {
  // Test Gemini AI connection
  async testConnection(): Promise<boolean> {
    try {
      if (!API_KEY) {
        console.error('Gemini API key not configured');
        return false;
      }

      // Try different model names that are commonly available
      const modelNames = ["gemini-1.5-flash", "gemini-pro", "gemma-3-27b-it"];

      for (const modelName of modelNames) {
        try {
          console.log(`Testing model: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent("Hello, this is a test. Please respond with 'Connection successful'.");
          const response = result.response;
          const text = response.text();

          console.log(`Model ${modelName} test response:`, text);
          if (text && text.length > 0) {
            console.log(`Successfully connected with model: ${modelName}`);
            return true;
          }
        } catch (modelError) {
          console.log(`Model ${modelName} failed:`, modelError);
          continue;
        }
      }

      console.log('Gemini AI test failed for all models');
      return false;
    } catch (error) {
      console.error('Gemini AI connection test failed:', error);
      return false;
    }
  },

  async getEcoSuggestions(userQuery: string, userContext?: {
    carbonEntries?: any[];
    userProfile?: any;
    location?: string;
  }): Promise<EcoSuggestion> {
    try {
      // Try different models in order of preference
      const modelNames = ["gemini-1.5-flash", "gemini-pro", "gemma-2-27b-it"];
      let text = '';
      let modelUsed = '';

      for (const modelName of modelNames) {
        try {
          console.log(`Trying model: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName });

          // Create a comprehensive prompt for eco-friendly suggestions
          const prompt = this.createEcoPrompt(userQuery, userContext);

          console.log('Sending request to Gemini AI...');
          const result = await model.generateContent(prompt);
          const response = result.response;
          text = response.text();
          modelUsed = modelName;

          console.log(`Gemini AI response received from ${modelName}`);
          break; // Success, exit the loop
        } catch (modelError) {
          console.log(`Model ${modelName} failed:`, modelError);
          continue; // Try next model
        }
      }

      if (!text) {
        throw new Error('All models failed to generate response');
      }

      // Parse the AI response
      const parsedResponse = this.parseAIResponse(text, userQuery);

      console.log(`Successfully generated response using model: ${modelUsed}`);

      return {
        id: Date.now().toString(),
        query: userQuery,
        response: parsedResponse.response,
        category: parsedResponse.category,
        timestamp: new Date().toLocaleString(),
        impact: parsedResponse.impact,
        actionItems: parsedResponse.actionItems,
        estimatedCO2Reduction: parsedResponse.estimatedCO2Reduction
      };
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      console.error('Error details:', {
        message: (error as any)?.message,
        code: (error as any)?.code,
        status: (error as any)?.status
      });
      
      // Fallback response
      return {
        id: Date.now().toString(),
        query: userQuery,
        response: "I'm sorry, I'm having trouble connecting to the AI service right now. Here are some general eco-friendly tips:\n\n• Reduce energy consumption by using LED bulbs\n• Choose sustainable transportation options\n• Minimize single-use plastics\n• Support local and organic food sources\n• Practice the 3 R's: Reduce, Reuse, Recycle",
        category: "General",
        timestamp: new Date().toLocaleString(),
        impact: "medium",
        actionItems: ["Switch to LED bulbs", "Use public transport", "Reduce plastic usage"],
        estimatedCO2Reduction: 0
      };
    }
  },

  createEcoPrompt(userQuery: string, userContext?: any): string {
    const basePrompt = `You are an expert environmental consultant and carbon footprint advisor. Your role is to provide personalized, actionable eco-friendly suggestions that help reduce carbon emissions and environmental impact.

USER QUERY: "${userQuery}"

CONTEXT:
${userContext?.carbonEntries ? `- User has tracked ${userContext.carbonEntries.length} carbon footprint entries` : ''}
${userContext?.userProfile?.greenPoints ? `- User has ${userContext.userProfile.greenPoints} green points` : ''}
${userContext?.location ? `- User location: ${userContext.location}` : ''}

INSTRUCTIONS:
1. Provide specific, actionable advice related to the user's query
2. Focus on practical solutions that can be implemented immediately
3. Include estimated CO2 reduction potential when possible
4. Categorize the advice (Transport, Energy, Food, Waste, Water, Shopping, General)
5. Assess the environmental impact level (low, medium, high)
6. Provide 3-5 specific action items
7. Make suggestions personal and encouraging
8. Include relevant statistics or facts when helpful

RESPONSE FORMAT:
Please structure your response as follows:

CATEGORY: [Transport/Energy/Food/Waste/Water/Shopping/General]
IMPACT: [low/medium/high]

MAIN_RESPONSE:
[Your detailed advice here - be specific, actionable, and encouraging. Use emojis and formatting to make it engaging. Include statistics and facts where relevant.]

ACTION_ITEMS:
- [Specific action 1]
- [Specific action 2]
- [Specific action 3]
- [Specific action 4]
- [Specific action 5]

CO2_REDUCTION: [Estimated annual CO2 reduction in kg, or 0 if not applicable]

Remember to be encouraging, specific, and focus on achievable changes that make a real environmental impact.`;

    return basePrompt;
  },

  parseAIResponse(aiText: string, originalQuery: string): {
    response: string;
    category: string;
    impact: 'low' | 'medium' | 'high';
    actionItems: string[];
    estimatedCO2Reduction: number;
  } {
    try {
      // Extract category
      const categoryMatch = aiText.match(/CATEGORY:\s*([^\n]+)/i);
      const category = categoryMatch ? categoryMatch[1].trim() : this.inferCategory(originalQuery);

      // Extract impact
      const impactMatch = aiText.match(/IMPACT:\s*(low|medium|high)/i);
      const impact = (impactMatch ? impactMatch[1].toLowerCase() : 'medium') as 'low' | 'medium' | 'high';

      // Extract main response
      const responseMatch = aiText.match(/MAIN_RESPONSE:\s*([\s\S]*?)(?=ACTION_ITEMS:|CO2_REDUCTION:|$)/i);
      const response = responseMatch ? responseMatch[1].trim() : aiText;

      // Extract action items
      const actionItemsMatch = aiText.match(/ACTION_ITEMS:\s*([\s\S]*?)(?=CO2_REDUCTION:|$)/i);
      let actionItems: string[] = [];
      if (actionItemsMatch) {
        actionItems = actionItemsMatch[1]
          .split('\n')
          .map(item => item.replace(/^-\s*/, '').trim())
          .filter(item => item.length > 0)
          .slice(0, 5);
      }

      // Extract CO2 reduction
      const co2Match = aiText.match(/CO2_REDUCTION:\s*(\d+(?:\.\d+)?)/i);
      const estimatedCO2Reduction = co2Match ? parseFloat(co2Match[1]) : 0;

      return {
        response: response || aiText,
        category,
        impact,
        actionItems,
        estimatedCO2Reduction
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return {
        response: aiText,
        category: this.inferCategory(originalQuery),
        impact: 'medium',
        actionItems: [],
        estimatedCO2Reduction: 0
      };
    }
  },

  inferCategory(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('transport') || lowerQuery.includes('car') || lowerQuery.includes('travel') || lowerQuery.includes('commute')) {
      return 'Transport';
    } else if (lowerQuery.includes('energy') || lowerQuery.includes('electric') || lowerQuery.includes('heating') || lowerQuery.includes('cooling')) {
      return 'Energy';
    } else if (lowerQuery.includes('food') || lowerQuery.includes('eat') || lowerQuery.includes('diet') || lowerQuery.includes('meal')) {
      return 'Food';
    } else if (lowerQuery.includes('waste') || lowerQuery.includes('recycle') || lowerQuery.includes('trash') || lowerQuery.includes('compost')) {
      return 'Waste';
    } else if (lowerQuery.includes('water') || lowerQuery.includes('shower') || lowerQuery.includes('irrigation')) {
      return 'Water';
    } else if (lowerQuery.includes('shop') || lowerQuery.includes('buy') || lowerQuery.includes('purchase') || lowerQuery.includes('product')) {
      return 'Shopping';
    }
    
    return 'General';
  }
};
