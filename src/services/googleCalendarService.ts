// Google Calendar API Integration for EcoCloudApp
class GoogleCalendarService {
  private readonly CALENDAR_API_KEY = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY || 'demo_key';
  private accessToken: string | null = null;

  // Initialize Google Calendar API
  async initialize() {
    try {
      if (!window.gapi) {
        await this.loadGoogleAPI();
      }

      await new Promise((resolve) => {
        window.gapi.load('auth2:client:calendar', resolve);
      });

      await window.gapi.client.init({
        apiKey: this.CALENDAR_API_KEY,
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar.events'
      });

      console.log('✅ Google Calendar API initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Google Calendar API:', error);
      return false;
    }
  }

  private loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    });
  }

  // Authenticate user
  async authenticate(): Promise<boolean> {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      
      if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn();
      }

      const user = authInstance.currentUser.get();
      this.accessToken = user.getAuthResponse().access_token;
      
      console.log('✅ Google Calendar authentication successful');
      return true;
    } catch (error) {
      console.error('❌ Google Calendar authentication failed:', error);
      return false;
    }
  }

  // Create eco-friendly reminder event
  async createEcoReminder(reminder: {
    title: string;
    description: string;
    date: Date;
    duration?: number; // minutes
    recurrence?: 'daily' | 'weekly' | 'monthly';
    category: 'transport' | 'energy' | 'waste' | 'food' | 'general';
  }): Promise<string | null> {
    try {
      if (!this.accessToken) {
        const authenticated = await this.authenticate();
        if (!authenticated) return null;
      }

      const startTime = new Date(reminder.date);
      const endTime = new Date(startTime.getTime() + (reminder.duration || 30) * 60000);

      const event = {
        summary: `🌱 ${reminder.title}`,
        description: `${reminder.description}\n\n📱 Created by EcoCloudApp\n🏷️ Category: ${reminder.category}`,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        colorId: this.getCategoryColor(reminder.category),
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 15 },
            { method: 'email', minutes: 60 }
          ]
        }
      };

      // Add recurrence if specified
      if (reminder.recurrence) {
        event['recurrence'] = [this.getRecurrenceRule(reminder.recurrence)];
      }

      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });

      console.log('✅ Eco reminder created:', response.result.id);
      return response.result.id;
    } catch (error) {
      console.error('❌ Failed to create eco reminder:', error);
      return null;
    }
  }

  // Create carbon tracking reminder
  async createCarbonTrackingReminder(frequency: 'daily' | 'weekly'): Promise<string | null> {
    const now = new Date();
    const reminderTime = new Date(now);
    
    if (frequency === 'daily') {
      reminderTime.setHours(19, 0, 0, 0); // 7 PM daily
    } else {
      reminderTime.setDate(now.getDate() + (7 - now.getDay())); // Next Sunday
      reminderTime.setHours(18, 0, 0, 0); // 6 PM weekly
    }

    return this.createEcoReminder({
      title: 'Track Your Carbon Footprint',
      description: `Time to log your ${frequency} carbon footprint activities! 📊\n\n• Transportation usage\n• Energy consumption\n• Waste generation\n• Food choices\n\nEvery entry helps you understand and reduce your environmental impact! 🌍`,
      date: reminderTime,
      duration: 15,
      recurrence: frequency === 'daily' ? 'daily' : 'weekly',
      category: 'general'
    });
  }

  // Create eco-challenge event
  async createEcoChallenge(challenge: {
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    goals: string[];
  }): Promise<string | null> {
    try {
      if (!this.accessToken) {
        const authenticated = await this.authenticate();
        if (!authenticated) return null;
      }

      const event = {
        summary: `🏆 Eco Challenge: ${challenge.name}`,
        description: `${challenge.description}\n\n🎯 Goals:\n${challenge.goals.map(goal => `• ${goal}`).join('\n')}\n\n📱 Created by EcoCloudApp`,
        start: {
          date: challenge.startDate.toISOString().split('T')[0]
        },
        end: {
          date: challenge.endDate.toISOString().split('T')[0]
        },
        colorId: '10', // Green color for eco challenges
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 1440 }, // 1 day before
            { method: 'email', minutes: 2880 }  // 2 days before
          ]
        }
      };

      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });

      console.log('✅ Eco challenge created:', response.result.id);
      return response.result.id;
    } catch (error) {
      console.error('❌ Failed to create eco challenge:', error);
      return null;
    }
  }

  // Get upcoming eco events
  async getUpcomingEcoEvents(days: number = 7): Promise<any[]> {
    try {
      if (!this.accessToken) {
        const authenticated = await this.authenticate();
        if (!authenticated) return [];
      }

      const timeMin = new Date().toISOString();
      const timeMax = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin,
        timeMax,
        q: 'EcoCloudApp',
        orderBy: 'startTime',
        singleEvents: true
      });

      return response.result.items || [];
    } catch (error) {
      console.error('❌ Failed to get upcoming eco events:', error);
      return [];
    }
  }

  // Helper methods
  private getCategoryColor(category: string): string {
    const colors = {
      transport: '4', // Blue
      energy: '6',    // Orange
      waste: '8',     // Gray
      food: '2',      // Green
      general: '10'   // Light Green
    };
    return colors[category] || colors.general;
  }

  private getRecurrenceRule(frequency: string): string {
    const rules = {
      daily: 'RRULE:FREQ=DAILY',
      weekly: 'RRULE:FREQ=WEEKLY',
      monthly: 'RRULE:FREQ=MONTHLY'
    };
    return rules[frequency] || rules.weekly;
  }

  // Predefined eco reminders
  getEcoReminderTemplates() {
    return [
      {
        title: 'Use Public Transport',
        description: 'Take the bus, train, or bike instead of driving today! 🚌🚲',
        category: 'transport',
        duration: 5
      },
      {
        title: 'Turn Off Unused Electronics',
        description: 'Check for devices that can be unplugged to save energy! 💡',
        category: 'energy',
        duration: 10
      },
      {
        title: 'Bring Reusable Bags',
        description: 'Remember to bring reusable bags for shopping! 🛍️',
        category: 'waste',
        duration: 5
      },
      {
        title: 'Eat Plant-Based Meal',
        description: 'Try a delicious plant-based meal today! 🥗',
        category: 'food',
        duration: 5
      },
      {
        title: 'Water Conservation Check',
        description: 'Check for leaks and practice water-saving habits! 💧',
        category: 'energy',
        duration: 15
      }
    ];
  }

  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }
}

export const googleCalendarService = new GoogleCalendarService();
