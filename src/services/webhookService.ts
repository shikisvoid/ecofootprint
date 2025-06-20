// Dialogflow Webhook Service for EcoCloudApp
// Handles fulfillment requests and integrates with existing services

import { carbonService } from './carbonService';
import { environmentalDataService } from './environmentalDataService';
import { environmentalReportsService } from './environmentalReportsService';
import type { User } from '@/types';

export interface WebhookRequest {
  queryResult: {
    queryText: string;
    action: string;
    parameters: Record<string, any>;
    intent: {
      displayName: string;
    };
  };
  session: string;
  originalDetectIntentRequest?: {
    source?: string;
    payload?: any;
  };
}

export interface WebhookResponse {
  fulfillmentText: string;
  fulfillmentMessages?: Array<{
    text?: {
      text: string[];
    };
    card?: {
      title: string;
      subtitle: string;
      imageUri?: string;
      buttons?: Array<{
        text: string;
        postback: string;
      }>;
    };
  }>;
  outputContexts?: Array<{
    name: string;
    lifespanCount: number;
    parameters: Record<string, any>;
  }>;
}

class WebhookService {
  // Main webhook handler
  async handleWebhook(request: WebhookRequest, userId: string): Promise<WebhookResponse> {
    const { action, parameters, queryText } = request.queryResult;
    
    console.log(`🎯 Webhook action: ${action}`, parameters);
    
    try {
      switch (action) {
        case 'get.carbon.footprint':
          return await this.handleGetCarbonFootprint(parameters, userId);
          
        case 'add.carbon.entry':
          return await this.handleAddCarbonEntry(parameters, userId);
          
        case 'get.environmental.data':
          return await this.handleGetEnvironmentalData(parameters, userId);
          
        case 'get.recommendations':
          return await this.handleGetRecommendations(parameters, userId);

        case 'get.reports':
          return await this.handleGetReports(parameters, userId);

        case 'get.achievements':
          return await this.handleGetAchievements(parameters, userId);

        case 'app.navigation.guide':
          return await this.handleAppNavigation(parameters, userId);

        case 'education.carbon.facts':
          return await this.handleCarbonFacts(parameters, userId);

        case 'support.technical.help':
          return await this.handleTechnicalSupport(parameters, userId);

        case 'app.feature.discovery':
          return await this.handleFeatureDiscovery(parameters, userId);

        default:
          return {
            fulfillmentText: "I'm not sure how to help with that. Try asking about your carbon footprint, environmental data, eco-friendly tips, app navigation, or if you need technical support! 🌱"
          };
      }
    } catch (error) {
      console.error('Webhook error:', error);
      return {
        fulfillmentText: "I'm sorry, I encountered an error while processing your request. Please try again later. 🤖"
      };
    }
  }

  // Handle carbon footprint queries
  private async handleGetCarbonFootprint(parameters: any, userId: string): Promise<WebhookResponse> {
    try {
      const timePeriod = parameters.time_period || 'this month';
      const category = parameters.category;
      
      // Get user's carbon entries
      const entries = await carbonService.getUserCarbonEntries(userId);
      const stats = await carbonService.getDashboardStats(userId);
      
      if (entries.length === 0) {
        return {
          fulfillmentText: "You haven't tracked any carbon emissions yet! Start by telling me about your daily activities like 'I drove 20 km today' or 'I used 50 kWh of electricity'. 📊"
        };
      }
      
      let responseText = '';
      let totalEmissions = 0;
      
      // Filter by time period
      const now = new Date();
      let filteredEntries = entries;
      
      switch (timePeriod) {
        case 'today':
          const today = now.toDateString();
          filteredEntries = entries.filter(entry => 
            new Date(entry.date).toDateString() === today
          );
          break;
        case 'this week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filteredEntries = entries.filter(entry => 
            new Date(entry.date) >= weekAgo
          );
          break;
        case 'this month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filteredEntries = entries.filter(entry => 
            new Date(entry.date) >= monthAgo
          );
          break;
      }
      
      // Filter by category if specified
      if (category) {
        filteredEntries = filteredEntries.filter(entry => 
          entry.category === category
        );
      }
      
      totalEmissions = filteredEntries.reduce((sum, entry) => sum + entry.co2Emission, 0);
      
      if (category) {
        responseText = `Your ${category} emissions ${timePeriod}: ${totalEmissions.toFixed(2)} kg CO₂ from ${filteredEntries.length} activities. `;
      } else {
        responseText = `Your total carbon footprint ${timePeriod}: ${totalEmissions.toFixed(2)} kg CO₂ from ${filteredEntries.length} activities. `;
      }
      
      // Add breakdown by category
      if (!category && filteredEntries.length > 0) {
        const breakdown = filteredEntries.reduce((acc, entry) => {
          acc[entry.category] = (acc[entry.category] || 0) + entry.co2Emission;
          return acc;
        }, {} as Record<string, number>);
        
        const breakdownText = Object.entries(breakdown)
          .map(([cat, emissions]) => `${cat}: ${emissions.toFixed(1)} kg`)
          .join(', ');
        
        responseText += `\n\nBreakdown: ${breakdownText}`;
      }
      
      // Add comparison or encouragement
      if (totalEmissions > 0) {
        responseText += `\n\n🌱 Keep tracking to monitor your progress! You've earned ${Math.floor(totalEmissions * 2)} green points so far.`;
      }
      
      return {
        fulfillmentText: responseText,
        fulfillmentMessages: [
          {
            text: {
              text: [responseText]
            }
          }
        ]
      };
    } catch (error) {
      console.error('Error getting carbon footprint:', error);
      return {
        fulfillmentText: "I couldn't retrieve your carbon footprint data right now. Please try again later. 📊"
      };
    }
  }

  // Handle adding carbon entries
  private async handleAddCarbonEntry(parameters: any, userId: string): Promise<WebhookResponse> {
    try {
      const category = parameters.category;
      const amount = parameters.amount;
      const activity = parameters.activity;
      
      if (!category) {
        return {
          fulfillmentText: "What category would you like to track? I can help with transport, energy, food, or waste emissions. 🚗🏠🍽️🗑️"
        };
      }
      
      // If we have all required info, add the entry
      if (category && amount) {
        // Use default activities based on category and amount
        let activityName = '';
        let co2Emission = 0;
        
        switch (category) {
          case 'transport':
            activityName = 'Car (Petrol)';
            co2Emission = amount * 0.21; // kg CO2 per km
            break;
          case 'energy':
            activityName = 'Electricity (kWh)';
            co2Emission = amount * 0.41; // kg CO2 per kWh
            break;
          case 'food':
            activityName = 'Mixed Diet';
            co2Emission = amount * 3.0; // kg CO2 per kg food
            break;
          case 'waste':
            activityName = 'General Waste';
            co2Emission = amount * 0.57; // kg CO2 per kg waste
            break;
          default:
            co2Emission = amount * 1.0; // default factor
        }
        
        const entry = {
          userId,
          category,
          activity: activityName,
          amount,
          co2Emission,
          date: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        
        await carbonService.addCarbonEntry(entry);
        
        const points = Math.floor(co2Emission * 2);
        
        return {
          fulfillmentText: `✅ Added ${amount} ${this.getUnitForCategory(category)} of ${activityName} to your carbon tracking!\n\nEmissions: ${co2Emission.toFixed(2)} kg CO₂\nGreen Points Earned: ${points} 🌱\n\nKeep tracking to monitor your environmental impact!`
        };
      }
      
      // If missing information, ask for it
      if (!amount) {
        return {
          fulfillmentText: `Great! I'll help you track ${category} emissions. How much would you like to log? For example:\n• Transport: "I drove 25 km"\n• Energy: "I used 15 kWh"\n• Food: "I ate 0.5 kg of beef"\n• Waste: "I threw away 2 kg of trash"`
        };
      }
      
      return {
        fulfillmentText: "I'll help you add a carbon footprint entry! Please tell me the category (transport, energy, food, or waste) and the amount. 📝"
      };
    } catch (error) {
      console.error('Error adding carbon entry:', error);
      return {
        fulfillmentText: "I couldn't add your carbon entry right now. Please try again later. 📝"
      };
    }
  }

  // Handle environmental data queries
  private async handleGetEnvironmentalData(parameters: any, userId: string): Promise<WebhookResponse> {
    try {
      const dataType = parameters.data_type;
      
      if (dataType === 'air_quality' || !dataType) {
        const airQuality = await environmentalDataService.getAirQuality();
        
        return {
          fulfillmentText: `🌬️ Air Quality in ${airQuality.location}:\n\nAQI: ${airQuality.aqi} (${airQuality.status})\nPM2.5: ${airQuality.pm25} μg/m³\nPM10: ${airQuality.pm10} μg/m³\n\n${this.getAirQualityAdvice(airQuality.aqi)}`
        };
      }
      
      if (dataType === 'weather') {
        const weather = await environmentalDataService.getWeatherData();
        
        return {
          fulfillmentText: `🌤️ Weather in ${weather.location}:\n\nTemperature: ${weather.temperature}°C\nCondition: ${weather.condition}\nHumidity: ${weather.humidity}%\nWind: ${weather.windSpeed} km/h\nUV Index: ${weather.uvIndex}`
        };
      }
      
      if (dataType === 'carbon_intensity') {
        const carbonIntensity = await environmentalDataService.getCarbonIntensity();
        
        return {
          fulfillmentText: `⚡ Carbon Intensity in ${carbonIntensity.region}:\n\nCurrent: ${carbonIntensity.intensity} gCO₂/kWh\n\n${this.getCarbonIntensityAdvice(carbonIntensity.intensity)}`
        };
      }
      
      // Get all environmental data
      const [airQuality, weather, carbonIntensity] = await Promise.all([
        environmentalDataService.getAirQuality(),
        environmentalDataService.getWeatherData(),
        environmentalDataService.getCarbonIntensity()
      ]);
      
      return {
        fulfillmentText: `🌍 Environmental Conditions:\n\n🌬️ Air Quality: ${airQuality.aqi} (${airQuality.status})\n🌤️ Weather: ${weather.temperature}°C, ${weather.condition}\n⚡ Carbon Intensity: ${carbonIntensity.intensity} gCO₂/kWh\n\nLocation: ${weather.location}`
      };
    } catch (error) {
      console.error('Error getting environmental data:', error);
      return {
        fulfillmentText: "I couldn't retrieve environmental data right now. Please try again later. 🌍"
      };
    }
  }

  // Handle recommendation requests
  private async handleGetRecommendations(parameters: any, userId: string): Promise<WebhookResponse> {
    const category = parameters.category;
    
    const recommendations = this.getRecommendationsByCategory(category);
    
    let responseText = category 
      ? `💡 Here are some tips to reduce your ${category} emissions:\n\n${recommendations.join('\n\n')}`
      : `💡 Here are some general tips to reduce your carbon footprint:\n\n${recommendations.join('\n\n')}`;
    
    responseText += '\n\n🌱 Start tracking these activities to see your impact!';
    
    return {
      fulfillmentText: responseText
    };
  }

  // Handle reports requests
  private async handleGetReports(parameters: any, userId: string): Promise<WebhookResponse> {
    try {
      const reportType = parameters.report_type || 'summary';
      const timePeriod = parameters.time_period || 'this month';

      // Get user's carbon entries for report generation
      const entries = await carbonService.getUserCarbonEntries(userId);
      const stats = await carbonService.getDashboardStats(userId);

      if (entries.length === 0) {
        return {
          fulfillmentText: "You don't have any carbon tracking data yet to generate a report. Start by logging your daily activities like driving, energy usage, or food consumption! 📊"
        };
      }

      // Generate report summary
      const totalEmissions = entries.reduce((sum, entry) => sum + entry.co2Emission, 0);
      const categoryBreakdown = entries.reduce((acc, entry) => {
        acc[entry.category] = (acc[entry.category] || 0) + entry.co2Emission;
        return acc;
      }, {} as Record<string, number>);

      const topCategory = Object.entries(categoryBreakdown)
        .sort(([,a], [,b]) => b - a)[0];

      let responseText = `📊 Your Environmental Report (${timePeriod}):\n\n`;
      responseText += `🌍 Total Emissions: ${totalEmissions.toFixed(2)} kg CO₂\n`;
      responseText += `📈 Activities Tracked: ${entries.length}\n`;
      responseText += `🏆 Green Points Earned: ${Math.floor(totalEmissions * 2)}\n\n`;

      responseText += `📋 Category Breakdown:\n`;
      Object.entries(categoryBreakdown)
        .sort(([,a], [,b]) => b - a)
        .forEach(([category, emissions]) => {
          const percentage = ((emissions / totalEmissions) * 100).toFixed(1);
          responseText += `• ${category}: ${emissions.toFixed(1)} kg CO₂ (${percentage}%)\n`;
        });

      if (topCategory) {
        responseText += `\n💡 Your highest impact category is ${topCategory[0]}. Consider focusing on reducing these emissions first!`;
      }

      return {
        fulfillmentText: responseText
      };
    } catch (error) {
      console.error('Error generating report:', error);
      return {
        fulfillmentText: "I couldn't generate your report right now. Please try again later. 📊"
      };
    }
  }

  // Handle achievements requests
  private async handleGetAchievements(parameters: any, userId: string): Promise<WebhookResponse> {
    try {
      // Get user's carbon entries and calculate achievements
      const entries = await carbonService.getUserCarbonEntries(userId);
      const stats = await carbonService.getDashboardStats(userId);

      const totalEmissions = entries.reduce((sum, entry) => sum + entry.co2Emission, 0);
      const greenPoints = Math.floor(totalEmissions * 2);
      const level = Math.floor(greenPoints / 100) + 1;
      const pointsToNextLevel = (level * 100) - greenPoints;

      // Calculate streaks and milestones
      const activeDays = new Set(entries.map(entry =>
        new Date(entry.date).toDateString()
      )).size;

      const categoriesTracked = new Set(entries.map(entry => entry.category)).size;

      let responseText = `🏆 Your Environmental Achievements:\n\n`;
      responseText += `🌱 Green Points: ${greenPoints}\n`;
      responseText += `📊 Level: ${level}\n`;
      responseText += `⬆️ Points to next level: ${pointsToNextLevel}\n\n`;

      responseText += `📈 Progress Milestones:\n`;
      responseText += `• Total CO₂ tracked: ${totalEmissions.toFixed(1)} kg\n`;
      responseText += `• Activities logged: ${entries.length}\n`;
      responseText += `• Active tracking days: ${activeDays}\n`;
      responseText += `• Categories explored: ${categoriesTracked}/4\n\n`;

      // Award virtual badges based on progress
      const badges = [];
      if (entries.length >= 10) badges.push('🌟 Tracking Enthusiast');
      if (activeDays >= 7) badges.push('📅 Week Warrior');
      if (categoriesTracked >= 3) badges.push('🌍 Eco Explorer');
      if (totalEmissions >= 50) badges.push('📊 Data Collector');
      if (greenPoints >= 100) badges.push('🏆 Green Champion');

      if (badges.length > 0) {
        responseText += `🎖️ Badges Earned:\n${badges.map(badge => `• ${badge}`).join('\n')}\n\n`;
      }

      responseText += `🎯 Keep tracking to unlock more achievements and climb the leaderboard!`;

      return {
        fulfillmentText: responseText
      };
    } catch (error) {
      console.error('Error getting achievements:', error);
      return {
        fulfillmentText: "I couldn't retrieve your achievements right now. Please try again later. 🏆"
      };
    }
  }

  // Handle app navigation guidance
  private async handleAppNavigation(parameters: any, userId: string): Promise<WebhookResponse> {
    const featureName = parameters.feature_name?.toLowerCase();
    const actionType = parameters.action_type?.toLowerCase();

    // App navigation guides
    const navigationGuides = {
      'carbon calculator': {
        title: '🧮 Carbon Calculator Guide',
        steps: [
          '1. Click on "Calculator" in the sidebar',
          '2. Select an activity category (Transport, Energy, Food, Waste)',
          '3. Choose the specific activity type',
          '4. Enter the amount (km, kWh, kg, etc.)',
          '5. Click "Calculate" to see your CO₂ impact',
          '6. Click "Add Entry" to save it to your tracking'
        ],
        tips: 'Pro tip: Use the quick entry buttons for common activities!'
      },
      'reports': {
        title: '📊 Reports Guide',
        steps: [
          '1. Navigate to "Reports" in the sidebar',
          '2. View your carbon footprint trends over time',
          '3. Use filters to see specific categories or time periods',
          '4. Click "Download PDF" to save your report',
          '5. Share your progress on social media'
        ],
        tips: 'Reports update in real-time as you add new carbon entries!'
      },
      'gamification': {
        title: '🏆 Gamification Guide',
        steps: [
          '1. Go to "Gamification" section',
          '2. View your current green points and level',
          '3. Check your badges and achievements',
          '4. See your activity streak and weekly targets',
          '5. Compare with friends on the leaderboard'
        ],
        tips: 'Earn points by tracking activities and achieving milestones!'
      },
      'profile': {
        title: '👤 Profile Settings Guide',
        steps: [
          '1. Click on your profile picture or "Profile"',
          '2. Update your personal information',
          '3. Set your carbon reduction goals',
          '4. Configure notification preferences',
          '5. Manage your privacy settings'
        ],
        tips: 'Set realistic goals to stay motivated on your eco journey!'
      },
      'suggestions': {
        title: '💡 AI Suggestions Guide',
        steps: [
          '1. Visit the "Suggestions" section',
          '2. Type your environmental question',
          '3. Get personalized AI-powered advice',
          '4. Follow the action items provided',
          '5. Track your progress implementing suggestions'
        ],
        tips: 'Be specific in your questions for more targeted advice!'
      }
    };

    // Handle specific feature requests
    if (featureName && navigationGuides[featureName]) {
      const guide = navigationGuides[featureName];
      let responseText = `${guide.title}\n\n`;
      responseText += `📋 Step-by-step instructions:\n`;
      responseText += guide.steps.join('\n') + '\n\n';
      responseText += `💡 ${guide.tips}\n\n`;
      responseText += `Need help with anything else? Just ask! 😊`;

      return { fulfillmentText: responseText };
    }

    // Handle general app tour
    if (actionType?.includes('tour') || featureName?.includes('tour') ||
        parameters.query?.toLowerCase().includes('show me around')) {
      return {
        fulfillmentText: `🌟 Welcome to EcoCloudApp! Here's what you can do:\n\n🧮 **Carbon Calculator**: Track your daily emissions\n📊 **Reports**: View your environmental progress\n🏆 **Gamification**: Earn points and badges\n💡 **AI Suggestions**: Get personalized eco advice\n👤 **Profile**: Manage your settings and goals\n🌍 **Environmental Data**: Check air quality and weather\n\nWhich feature would you like to explore first? Just say "How do I use [feature name]" and I'll guide you through it! 🚀`
      };
    }

    // Default app overview
    return {
      fulfillmentText: `🧭 I can help you navigate EcoCloudApp! Here are the main features:\n\n• **Carbon Calculator** - Track your emissions\n• **Reports** - View your progress\n• **Gamification** - Earn rewards\n• **AI Suggestions** - Get eco advice\n• **Profile** - Manage settings\n\nTry asking: "How do I use the carbon calculator?" or "Show me around the app" for detailed guidance! 🌱`
    };
  }

  // Handle carbon facts and education
  private async handleCarbonFacts(parameters: any, userId: string): Promise<WebhookResponse> {
    const factCategory = parameters.fact_category;
    const factType = parameters.fact_type;

    // Get current season for seasonal facts
    const currentMonth = new Date().getMonth();
    const season = this.getCurrentSeason(currentMonth);

    // Category-specific facts
    const categoryFacts = {
      transport: [
        "🚗 Did you know? The average car emits about 4.6 metric tons of CO₂ per year!",
        "✈️ A single round-trip flight from New York to London generates about 1.2 tons of CO₂ per passenger.",
        "🚲 Cycling just 10 km instead of driving can save 2.6 kg of CO₂ emissions!",
        "🚌 Public transport produces 45% less CO₂ per passenger mile than private vehicles.",
        "🚂 Trains are 3-4 times more energy efficient than cars for the same distance."
      ],
      energy: [
        "💡 LED bulbs use 75% less energy than incandescent bulbs and last 25 times longer!",
        "🏠 Heating and cooling account for about 48% of home energy use in most climates.",
        "☀️ Solar panels can reduce your home's carbon footprint by 3-4 tons of CO₂ annually.",
        "🔌 Unplugging devices when not in use can save 5-10% on your electricity bill.",
        "🌡️ Lowering your thermostat by just 1°C can reduce heating emissions by 5-10%."
      ],
      food: [
        "🥩 Beef production generates 60kg of CO₂ per kg of meat - more than any other food!",
        "🌱 Plant-based diets can reduce food-related emissions by up to 73%.",
        "🥛 Dairy products account for about 4% of global greenhouse gas emissions.",
        "🍎 Eating local, seasonal produce can reduce food transport emissions by 90%.",
        "🗑️ Food waste generates 3.3 billion tons of CO₂ globally each year!"
      ],
      waste: [
        "♻️ Recycling one aluminum can saves enough energy to power a TV for 3 hours!",
        "🗑️ The average person generates 4.5 pounds of waste per day.",
        "🌍 Plastic takes 400-1000 years to decompose in landfills.",
        "📱 E-waste is the fastest growing waste stream, increasing by 21% in 5 years.",
        "🏠 Composting can reduce household waste by 30% and create nutrient-rich soil."
      ]
    };

    // Seasonal facts
    const seasonalFacts = {
      winter: [
        "❄️ Winter heating can double your home's energy consumption compared to summer!",
        "🔥 Using a programmable thermostat can save 10% on heating costs.",
        "🧥 Wearing warmer clothes indoors lets you lower the thermostat by 2-3°C."
      ],
      spring: [
        "🌸 Spring is perfect for starting a garden - growing your own food reduces transport emissions!",
        "🚲 Warmer weather makes cycling and walking more appealing alternatives to driving.",
        "🌱 This is the ideal time to plant trees, which absorb 48 lbs of CO₂ per year when mature."
      ],
      summer: [
        "☀️ Air conditioning can account for 70% of your summer electricity bill!",
        "🌞 Solar panels are most efficient during long summer days.",
        "💧 Outdoor water use can increase by 30% in summer - consider drought-resistant plants."
      ],
      fall: [
        "🍂 Fall leaves make excellent compost material for next year's garden!",
        "🏠 This is the best time to weatherize your home before winter heating season.",
        "🌰 Eating seasonal fall produce like squash and apples reduces transport emissions."
      ]
    };

    // General interesting facts
    const generalFacts = [
      "🌍 If everyone lived like the average American, we'd need 5 Earths to sustain us!",
      "🌳 One mature tree absorbs 48 lbs of CO₂ per year and releases oxygen for 2 people.",
      "⚡ The internet and digital technologies account for 4% of global greenhouse gas emissions.",
      "🌊 Ocean levels have risen 8-9 inches since 1880 due to climate change.",
      "🔥 The last decade was the warmest on record globally.",
      "💨 Renewable energy now provides 26% of global electricity generation.",
      "🌱 Reforestation could remove 25% of current atmospheric CO₂.",
      "🏭 Just 100 companies are responsible for 71% of global emissions."
    ];

    let selectedFact = '';
    let factContext = '';

    // Select fact based on category or random
    if (factCategory && categoryFacts[factCategory]) {
      const facts = categoryFacts[factCategory];
      selectedFact = facts[Math.floor(Math.random() * facts.length)];
      factContext = `Here's an interesting fact about ${factCategory}:`;
    } else {
      // Mix of seasonal and general facts
      const allFacts = [...generalFacts, ...seasonalFacts[season]];
      selectedFact = allFacts[Math.floor(Math.random() * allFacts.length)];
      factContext = `Here's a fascinating environmental fact:`;
    }

    // Add user-specific context if available
    try {
      const entries = await carbonService.getUserCarbonEntries(userId);
      if (entries.length > 0) {
        const userCategories = [...new Set(entries.map(e => e.category))];
        const mostTracked = entries.reduce((acc, entry) => {
          acc[entry.category] = (acc[entry.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const topCategory = Object.entries(mostTracked)
          .sort(([,a], [,b]) => b - a)[0][0];

        if (topCategory && categoryFacts[topCategory] && !factCategory) {
          const facts = categoryFacts[topCategory];
          selectedFact = facts[Math.floor(Math.random() * facts.length)];
          factContext = `Since you track a lot of ${topCategory} activities, here's a relevant fact:`;
        }
      }
    } catch (error) {
      // Continue with general fact if user data unavailable
    }

    const responseText = `${factContext}\n\n${selectedFact}\n\n🌱 Want to learn more? Ask me about specific categories like "Tell me about transport emissions" or "Share an energy fact"!`;

    return { fulfillmentText: responseText };
  }

  // Helper methods
  private getCurrentSeason(month: number): string {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  // Handle technical support and troubleshooting
  private async handleTechnicalSupport(parameters: any, userId: string): Promise<WebhookResponse> {
    const issueType = parameters.issue_type?.toLowerCase();
    const featureAffected = parameters.feature_affected?.toLowerCase();

    // Common troubleshooting guides
    const troubleshootingGuides = {
      login: {
        title: '🔐 Login Issues',
        steps: [
          '1. Check your internet connection',
          '2. Verify your email and password are correct',
          '3. Try clearing your browser cache and cookies',
          '4. Disable browser extensions temporarily',
          '5. Try using an incognito/private browsing window',
          '6. Reset your password if needed'
        ],
        alternatives: 'You can also try logging in with Google if you set that up previously.'
      },
      'data not saving': {
        title: '💾 Data Saving Issues',
        steps: [
          '1. Check your internet connection',
          '2. Refresh the page and try again',
          '3. Make sure you clicked "Save" or "Add Entry"',
          '4. Clear browser cache and reload',
          '5. Try using a different browser',
          '6. Check if you\'re still logged in'
        ],
        alternatives: 'Your data is automatically backed up, so don\'t worry about losing previous entries.'
      },
      'not loading': {
        title: '⏳ Loading Issues',
        steps: [
          '1. Check your internet connection speed',
          '2. Refresh the page (Ctrl+F5 or Cmd+Shift+R)',
          '3. Clear browser cache and cookies',
          '4. Disable ad blockers temporarily',
          '5. Try a different browser or device',
          '6. Check if the issue persists in incognito mode'
        ],
        alternatives: 'If a specific feature isn\'t loading, try accessing it from the main menu.'
      },
      'calculator': {
        title: '🧮 Calculator Issues',
        steps: [
          '1. Make sure you\'ve selected an activity category',
          '2. Enter a valid number in the amount field',
          '3. Check that all required fields are filled',
          '4. Try refreshing the calculator page',
          '5. Clear any browser extensions that might interfere'
        ],
        alternatives: 'You can also add entries manually through the "Add Entry" button.'
      },
      'reports': {
        title: '📊 Reports Issues',
        steps: [
          '1. Make sure you have carbon entries to generate reports',
          '2. Try selecting a different time period',
          '3. Refresh the reports page',
          '4. Check if your browser supports PDF generation',
          '5. Try downloading the report in a different format'
        ],
        alternatives: 'You can view your data in the Dashboard if reports aren\'t working.'
      }
    };

    // Determine which guide to use
    let guide = null;
    let responseTitle = '🔧 Technical Support';

    if (issueType && troubleshootingGuides[issueType]) {
      guide = troubleshootingGuides[issueType];
    } else if (featureAffected && troubleshootingGuides[featureAffected]) {
      guide = troubleshootingGuides[featureAffected];
    } else if (issueType?.includes('not working') || issueType?.includes('broken')) {
      guide = troubleshootingGuides['not loading'];
    } else if (featureAffected) {
      // Generic feature troubleshooting
      guide = {
        title: `🔧 ${featureAffected.charAt(0).toUpperCase() + featureAffected.slice(1)} Issues`,
        steps: [
          '1. Refresh the page and try again',
          '2. Check your internet connection',
          '3. Clear browser cache and cookies',
          '4. Try using a different browser',
          '5. Make sure you\'re logged in',
          '6. Contact support if the issue persists'
        ],
        alternatives: 'Try accessing the feature from a different part of the app.'
      };
    }

    if (guide) {
      let responseText = `${guide.title}\n\n`;
      responseText += `🛠️ **Troubleshooting Steps:**\n`;
      responseText += guide.steps.join('\n') + '\n\n';

      if (guide.alternatives) {
        responseText += `💡 **Alternative:** ${guide.alternatives}\n\n`;
      }

      responseText += `Still having trouble? Let me know and I can:\n`;
      responseText += `• Guide you through more advanced solutions\n`;
      responseText += `• Help you contact our support team\n`;
      responseText += `• Suggest alternative ways to accomplish your task\n\n`;
      responseText += `Just describe what's happening and I'll help! 😊`;

      return { fulfillmentText: responseText };
    }

    // General support response
    return {
      fulfillmentText: `🔧 I'm here to help with technical issues!\n\nCommon problems I can help with:\n• **Login issues** - "I can't log in"\n• **Data not saving** - "My entries aren't saving"\n• **Features not loading** - "The calculator won't load"\n• **General app problems** - "Something is broken"\n\nPlease describe your specific issue and I'll provide step-by-step troubleshooting guidance!\n\nFor urgent issues, you can also contact our support team directly. 📧`
    };
  }

  // Handle feature discovery and recommendations
  private async handleFeatureDiscovery(parameters: any, userId: string): Promise<WebhookResponse> {
    const userGoal = parameters.user_goal?.toLowerCase();

    try {
      // Get user's current usage to recommend unused features
      const entries = await carbonService.getUserCarbonEntries(userId);
      const stats = await carbonService.getDashboardStats(userId);

      // Analyze user's current engagement
      const hasEntries = entries.length > 0;
      const categoriesUsed = new Set(entries.map(e => e.category));
      const totalEntries = entries.length;
      const activeDays = new Set(entries.map(e => new Date(e.date).toDateString())).size;

      // Feature recommendations based on user goals
      const goalBasedRecommendations = {
        'track progress': {
          primary: 'Reports',
          description: 'View detailed charts and trends of your carbon footprint over time',
          action: 'Go to Reports → Select time period → Download PDF reports'
        },
        'reduce emissions': {
          primary: 'AI Suggestions',
          description: 'Get personalized recommendations from our AI consultant',
          action: 'Visit Suggestions → Ask specific questions → Follow action items'
        },
        'stay motivated': {
          primary: 'Gamification',
          description: 'Earn points, badges, and compete with friends',
          action: 'Check Gamification → Set goals → Track your streak'
        },
        'get started': {
          primary: 'Carbon Calculator',
          description: 'Start tracking your daily activities and their environmental impact',
          action: 'Use Calculator → Select activity → Enter amount → Add to tracking'
        }
      };

      let responseText = '';

      // Handle specific user goals
      if (userGoal && goalBasedRecommendations[userGoal]) {
        const rec = goalBasedRecommendations[userGoal];
        responseText = `🎯 Perfect! To ${userGoal}, I recommend the **${rec.primary}** feature:\n\n`;
        responseText += `📝 **What it does:** ${rec.description}\n\n`;
        responseText += `🚀 **How to use it:** ${rec.action}\n\n`;
        responseText += `Want me to guide you through it step by step? Just ask "How do I use ${rec.primary.toLowerCase()}"! 😊`;

        return { fulfillmentText: responseText };
      }

      // Personalized recommendations based on usage
      responseText = `🔍 **Feature Discovery for You**\n\n`;

      if (!hasEntries) {
        responseText += `🌟 **Get Started:**\n`;
        responseText += `• **Carbon Calculator** - Start tracking your daily activities\n`;
        responseText += `• **Profile Settings** - Set your environmental goals\n\n`;
        responseText += `💡 **Tip:** Begin with the calculator to log a few activities, then explore other features!\n\n`;
      } else {
        responseText += `📊 **Your Progress:** ${totalEntries} entries across ${activeDays} days\n\n`;

        // Recommend unused categories
        const allCategories = ['transport', 'energy', 'food', 'waste'];
        const unusedCategories = allCategories.filter(cat => !categoriesUsed.has(cat));

        if (unusedCategories.length > 0) {
          responseText += `🆕 **Try These Categories:**\n`;
          unusedCategories.forEach(cat => {
            responseText += `• **${cat.charAt(0).toUpperCase() + cat.slice(1)}** - Track your ${cat} impact\n`;
          });
          responseText += `\n`;
        }

        // Feature recommendations based on usage level
        if (totalEntries >= 10) {
          responseText += `🏆 **Advanced Features for You:**\n`;
          responseText += `• **Reports** - Analyze your trends and download PDFs\n`;
          responseText += `• **AI Suggestions** - Get personalized reduction strategies\n`;
          responseText += `• **Gamification** - You've earned ${Math.floor(totalEntries * 2)} green points!\n\n`;
        } else {
          responseText += `🌱 **Next Steps:**\n`;
          responseText += `• **Keep Tracking** - Add more daily activities\n`;
          responseText += `• **Set Goals** - Visit Profile to set reduction targets\n`;
          responseText += `• **Learn Facts** - Ask me "Tell me a carbon fact"\n\n`;
        }
      }

      // Always available features
      responseText += `🌍 **Always Available:**\n`;
      responseText += `• **Environmental Data** - Check air quality and weather\n`;
      responseText += `• **Daily Tips** - Get bite-sized eco advice\n`;
      responseText += `• **App Guidance** - Ask me "How do I use [feature]"\n\n`;

      responseText += `What would you like to explore first? I can guide you through any feature! 🚀`;

      return { fulfillmentText: responseText };

    } catch (error) {
      console.error('Error in feature discovery:', error);

      // Fallback recommendations
      return {
        fulfillmentText: `🔍 **Discover EcoCloudApp Features:**\n\n🧮 **Carbon Calculator** - Track daily emissions\n📊 **Reports** - View your progress over time\n🏆 **Gamification** - Earn points and badges\n💡 **AI Suggestions** - Get personalized eco advice\n👤 **Profile** - Set goals and preferences\n🌍 **Environmental Data** - Real-time air quality\n\nNew here? Start with the Carbon Calculator!\nWant detailed guidance? Ask "How do I use [feature name]"\n\nWhat interests you most? 😊`
      };
    }
  }

  private getUnitForCategory(category: string): string {
    switch (category) {
      case 'transport': return 'km';
      case 'energy': return 'kWh';
      case 'food': return 'kg';
      case 'waste': return 'kg';
      default: return 'units';
    }
  }

  private getAirQualityAdvice(aqi: number): string {
    if (aqi <= 50) return '✅ Air quality is good! Great day for outdoor activities.';
    if (aqi <= 100) return '⚠️ Air quality is moderate. Sensitive individuals should limit outdoor activities.';
    if (aqi <= 150) return '🚨 Air quality is unhealthy for sensitive groups. Consider staying indoors.';
    return '🚨 Air quality is unhealthy. Avoid outdoor activities and consider wearing a mask.';
  }

  private getCarbonIntensityAdvice(intensity: number): string {
    if (intensity < 200) return '✅ Low carbon intensity! Good time to use electricity.';
    if (intensity < 400) return '⚠️ Moderate carbon intensity. Consider reducing energy use.';
    return '🚨 High carbon intensity. Try to minimize electricity usage right now.';
  }

  private getRecommendationsByCategory(category?: string): string[] {
    const allRecommendations = {
      transport: [
        '🚶 Walk or bike for short trips instead of driving',
        '🚌 Use public transportation when possible',
        '🚗 Carpool or use ride-sharing services',
        '⚡ Consider electric or hybrid vehicles',
        '🏠 Work from home when possible to reduce commuting'
      ],
      energy: [
        '💡 Switch to LED light bulbs',
        '🌡️ Adjust thermostat by 2-3 degrees',
        '🔌 Unplug electronics when not in use',
        '☀️ Use natural light during the day',
        '⚡ Consider renewable energy sources'
      ],
      food: [
        '🥬 Eat more plant-based meals',
        '🥩 Reduce red meat consumption',
        '🛒 Buy local and seasonal produce',
        '🗑️ Reduce food waste by meal planning',
        '♻️ Compost organic waste'
      ],
      waste: [
        '♻️ Recycle paper, plastic, and glass',
        '🗑️ Reduce single-use items',
        '🛍️ Use reusable bags and containers',
        '🔄 Buy products with minimal packaging',
        '🌱 Compost organic waste'
      ]
    };

    if (category && allRecommendations[category as keyof typeof allRecommendations]) {
      return allRecommendations[category as keyof typeof allRecommendations];
    }

    // Return general recommendations
    return [
      '🚶 Choose walking, biking, or public transport over driving',
      '💡 Use energy-efficient appliances and LED lighting',
      '🥬 Eat more plant-based meals and reduce meat consumption',
      '♻️ Recycle and reduce waste wherever possible',
      '🌱 Track your activities to monitor your progress!'
    ];
  }
}

export const webhookService = new WebhookService();
