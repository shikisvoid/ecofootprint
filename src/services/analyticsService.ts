// Google Analytics 4 Integration for EcoCloudApp
import { getAnalytics, logEvent, setUserProperties } from 'firebase/analytics';
import app from '../lib/firebase';

class AnalyticsService {
  private analytics;
  private isEnabled: boolean = false;

  constructor() {
    try {
      this.analytics = getAnalytics(app);
      this.isEnabled = true;
      console.log('✅ Google Analytics initialized');
    } catch (error) {
      console.warn('⚠️ Google Analytics not available:', error);
      this.isEnabled = false;
    }
  }

  // Track carbon footprint calculations
  trackCarbonCalculation(category: string, amount: number, unit: string) {
    if (!this.isEnabled) return;
    
    logEvent(this.analytics, 'carbon_calculation', {
      category,
      amount,
      unit,
      timestamp: new Date().toISOString()
    });
  }

  // Track eco suggestions usage
  trackEcoSuggestion(query: string, category: string, impact: string) {
    if (!this.isEnabled) return;
    
    logEvent(this.analytics, 'eco_suggestion_requested', {
      query_category: category,
      impact_level: impact,
      timestamp: new Date().toISOString()
    });
  }

  // Track user achievements
  trackAchievement(achievementName: string, points: number) {
    if (!this.isEnabled) return;
    
    logEvent(this.analytics, 'achievement_unlocked', {
      achievement_name: achievementName,
      points_earned: points,
      timestamp: new Date().toISOString()
    });
  }

  // Track report generation
  trackReportGeneration(reportType: string, period: string) {
    if (!this.isEnabled) return;
    
    logEvent(this.analytics, 'report_generated', {
      report_type: reportType,
      time_period: period,
      timestamp: new Date().toISOString()
    });
  }

  // Set user properties for better analytics
  setUserProperties(userId: string, properties: {
    preferred_theme?: string;
    location?: string;
    user_level?: string;
  }) {
    if (!this.isEnabled) return;
    
    setUserProperties(this.analytics, {
      user_id: userId,
      ...properties
    });
  }

  // Track page views
  trackPageView(pageName: string) {
    if (!this.isEnabled) return;
    
    logEvent(this.analytics, 'page_view', {
      page_title: pageName,
      timestamp: new Date().toISOString()
    });
  }
}

export const analyticsService = new AnalyticsService();
