import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { environmentalDataService } from './environmentalDataService';

export interface EnvironmentalReport {
  id?: string;
  userId: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'real-time';
  period: string;
  generatedDate: string;
  status: 'generating' | 'completed' | 'failed';
  
  // Carbon footprint data
  totalEmissions: number;
  emissionsByCategory: {
    transport: number;
    energy: number;
    food: number;
    waste: number;
    water: number;
    shopping: number;
  };
  reduction: number;
  greenPoints: number;
  
  // Environmental data
  airQuality?: {
    aqi: number;
    status: string;
    location: string;
  };
  weather?: {
    temperature: number;
    humidity: number;
    condition: string;
    location: string;
  };
  carbonIntensity?: {
    intensity: number;
    region: string;
  };
  
  // Insights and recommendations
  insights: string[];
  recommendations: string[];
  achievements: string[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface RealtimeEnvironmentalData {
  id?: string;
  userId: string;
  timestamp: string;
  location: {
    lat: number;
    lon: number;
    city: string;
  };
  airQuality: {
    aqi: number;
    pm25: number;
    pm10: number;
    status: string;
  };
  weather: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    condition: string;
  };
  carbonIntensity: {
    intensity: number;
    region: string;
  };
  userCarbonFootprint: {
    dailyEmissions: number;
    weeklyEmissions: number;
    monthlyEmissions: number;
  };
}

class EnvironmentalReportsService {
  // Generate a comprehensive environmental report
  async generateReport(
    userId: string, 
    type: EnvironmentalReport['type'],
    carbonEntries: any[]
  ): Promise<string> {
    try {
      console.log(`Generating ${type} environmental report for user:`, userId);

      // Get current environmental data
      const [airQuality, weather, carbonIntensity] = await Promise.all([
        environmentalDataService.getAirQuality(),
        environmentalDataService.getWeatherData(),
        environmentalDataService.getCarbonIntensity()
      ]);

      // Calculate carbon footprint metrics
      const metrics = this.calculateCarbonMetrics(carbonEntries, type);
      
      // Generate insights and recommendations
      const insights = this.generateInsights(metrics, airQuality, weather);
      const recommendations = this.generateRecommendations(metrics, airQuality);
      const achievements = this.generateAchievements(metrics);

      const report: Omit<EnvironmentalReport, 'id'> = {
        userId,
        title: `${this.capitalizeFirst(type)} Environmental Report`,
        type,
        period: this.getPeriodString(type),
        generatedDate: new Date().toISOString(),
        status: 'completed',
        totalEmissions: metrics.totalEmissions,
        emissionsByCategory: metrics.emissionsByCategory,
        reduction: metrics.reduction,
        greenPoints: metrics.greenPoints,
        airQuality: {
          aqi: airQuality.aqi,
          status: airQuality.status,
          location: airQuality.location
        },
        weather: {
          temperature: weather.temperature,
          humidity: weather.humidity,
          condition: weather.condition,
          location: weather.location
        },
        carbonIntensity: {
          intensity: carbonIntensity.intensity,
          region: carbonIntensity.region
        },
        insights,
        recommendations,
        achievements,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'environmentalReports'), report);
      console.log('Environmental report generated with ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('Error generating environmental report:', error);
      throw error;
    }
  }

  // Get user's environmental reports
  async getUserReports(userId: string): Promise<EnvironmentalReport[]> {
    try {
      const q = query(
        collection(db, 'environmentalReports'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const reports: EnvironmentalReport[] = [];

      querySnapshot.forEach((doc) => {
        reports.push({ id: doc.id, ...doc.data() } as EnvironmentalReport);
      });

      return reports;
    } catch (error) {
      console.error('Error getting user reports:', error);
      return [];
    }
  }

  // Subscribe to real-time reports updates
  subscribeToUserReports(userId: string, callback: (reports: EnvironmentalReport[]) => void) {
    const q = query(
      collection(db, 'environmentalReports'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const reports: EnvironmentalReport[] = [];
      querySnapshot.forEach((doc) => {
        reports.push({ id: doc.id, ...doc.data() } as EnvironmentalReport);
      });
      callback(reports);
    });
  }

  // Store real-time environmental data
  async storeRealtimeData(userId: string, carbonEntries: any[]): Promise<string> {
    try {
      // Get current location and environmental data
      const location = await environmentalDataService.getUserLocation();
      const [airQuality, weather, carbonIntensity] = await Promise.all([
        environmentalDataService.getAirQuality(location.lat, location.lon),
        environmentalDataService.getWeatherData(location.lat, location.lon),
        environmentalDataService.getCarbonIntensity()
      ]);

      // Calculate user's carbon footprint
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const dailyEmissions = carbonEntries
        .filter(entry => new Date(entry.date) >= today)
        .reduce((sum, entry) => sum + entry.co2Emission, 0);

      const weeklyEmissions = carbonEntries
        .filter(entry => new Date(entry.date) >= weekAgo)
        .reduce((sum, entry) => sum + entry.co2Emission, 0);

      const monthlyEmissions = carbonEntries
        .filter(entry => new Date(entry.date) >= monthAgo)
        .reduce((sum, entry) => sum + entry.co2Emission, 0);

      const realtimeData: Omit<RealtimeEnvironmentalData, 'id'> = {
        userId,
        timestamp: new Date().toISOString(),
        location,
        airQuality: {
          aqi: airQuality.aqi,
          pm25: airQuality.pm25,
          pm10: airQuality.pm10,
          status: airQuality.status
        },
        weather: {
          temperature: weather.temperature,
          humidity: weather.humidity,
          windSpeed: weather.windSpeed,
          condition: weather.condition
        },
        carbonIntensity: {
          intensity: carbonIntensity.intensity,
          region: carbonIntensity.region
        },
        userCarbonFootprint: {
          dailyEmissions,
          weeklyEmissions,
          monthlyEmissions
        }
      };

      const docRef = await addDoc(collection(db, 'realtimeEnvironmentalData'), realtimeData);
      return docRef.id;
    } catch (error) {
      console.error('Error storing realtime data:', error);
      throw error;
    }
  }

  // Get latest real-time environmental data
  async getLatestRealtimeData(userId: string): Promise<RealtimeEnvironmentalData | null> {
    try {
      const q = query(
        collection(db, 'realtimeEnvironmentalData'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;

      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as RealtimeEnvironmentalData;
    } catch (error) {
      console.error('Error getting latest realtime data:', error);
      return null;
    }
  }

  // Subscribe to real-time environmental data updates
  subscribeToRealtimeData(userId: string, callback: (data: RealtimeEnvironmentalData | null) => void) {
    const q = query(
      collection(db, 'realtimeEnvironmentalData'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      if (querySnapshot.empty) {
        callback(null);
        return;
      }

      const doc = querySnapshot.docs[0];
      callback({ id: doc.id, ...doc.data() } as RealtimeEnvironmentalData);
    });
  }

  // Delete a report
  async deleteReport(reportId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'environmentalReports', reportId));
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  }

  // Helper methods
  private calculateCarbonMetrics(carbonEntries: any[], type: string) {
    const now = new Date();
    let startDate: Date;

    switch (type) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarterly':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const periodEntries = carbonEntries.filter(entry => new Date(entry.date) >= startDate);
    
    const totalEmissions = periodEntries.reduce((sum, entry) => sum + entry.co2Emission, 0);
    const greenPoints = periodEntries.reduce((sum, entry) => sum + Math.floor(entry.co2Emission * 2), 0);

    const emissionsByCategory = {
      transport: 0,
      energy: 0,
      food: 0,
      waste: 0,
      water: 0,
      shopping: 0
    };

    periodEntries.forEach(entry => {
      const category = entry.category.toLowerCase();
      if (emissionsByCategory.hasOwnProperty(category)) {
        emissionsByCategory[category as keyof typeof emissionsByCategory] += entry.co2Emission;
      }
    });

    // Calculate reduction compared to previous period
    const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    const previousEntries = carbonEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= previousPeriodStart && entryDate < startDate;
    });
    const previousEmissions = previousEntries.reduce((sum, entry) => sum + entry.co2Emission, 0);
    const reduction = previousEmissions > 0 ? ((previousEmissions - totalEmissions) / previousEmissions) * 100 : 0;

    return {
      totalEmissions,
      emissionsByCategory,
      reduction,
      greenPoints
    };
  }

  private generateInsights(metrics: any, airQuality: any, weather: any): string[] {
    const insights = [];

    if (metrics.reduction > 10) {
      insights.push(`🎉 Great progress! You've reduced your carbon emissions by ${metrics.reduction.toFixed(1)}% this period.`);
    } else if (metrics.reduction < -10) {
      insights.push(`⚠️ Your carbon emissions increased by ${Math.abs(metrics.reduction).toFixed(1)}% this period. Consider reviewing your activities.`);
    }

    if (airQuality.aqi > 100) {
      insights.push(`🌫️ Air quality is ${airQuality.status.toLowerCase()} in your area (AQI: ${airQuality.aqi}). Consider reducing outdoor activities.`);
    } else {
      insights.push(`🌿 Air quality is good in your area (AQI: ${airQuality.aqi}). Great time for outdoor activities!`);
    }

    const topCategory = Object.entries(metrics.emissionsByCategory)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];
    
    if (topCategory && topCategory[1] > 0) {
      insights.push(`📊 Your highest emissions category is ${topCategory[0]} (${(topCategory[1] as number).toFixed(1)} kg CO₂).`);
    }

    return insights;
  }

  private generateRecommendations(metrics: any, airQuality: any): string[] {
    const recommendations = [];

    const topCategory = Object.entries(metrics.emissionsByCategory)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];

    if (topCategory) {
      switch (topCategory[0]) {
        case 'transport':
          recommendations.push('🚲 Consider using public transport, cycling, or walking for short trips.');
          break;
        case 'energy':
          recommendations.push('💡 Switch to LED bulbs and unplug devices when not in use.');
          break;
        case 'food':
          recommendations.push('🥬 Try incorporating more plant-based meals into your diet.');
          break;
      }
    }

    if (airQuality.aqi > 100) {
      recommendations.push('🏠 Consider using air purifiers indoors and avoid outdoor exercise during peak pollution hours.');
    }

    recommendations.push('📱 Continue tracking your carbon footprint to maintain awareness of your environmental impact.');

    return recommendations;
  }

  private generateAchievements(metrics: any): string[] {
    const achievements = [];

    if (metrics.reduction > 20) {
      achievements.push('🏆 Carbon Reduction Champion - Reduced emissions by over 20%!');
    }

    if (metrics.greenPoints > 100) {
      achievements.push('⭐ Green Points Collector - Earned over 100 green points!');
    }

    if (metrics.totalEmissions < 10) {
      achievements.push('🌱 Low Carbon Lifestyle - Kept emissions under 10kg CO₂!');
    }

    return achievements;
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private getPeriodString(type: string): string {
    const now = new Date();
    switch (type) {
      case 'daily':
        return now.toLocaleDateString();
      case 'weekly':
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return `${weekStart.toLocaleDateString()} - ${now.toLocaleDateString()}`;
      case 'monthly':
        return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3) + 1;
        return `Q${quarter} ${now.getFullYear()}`;
      case 'yearly':
        return now.getFullYear().toString();
      default:
        return 'Real-time';
    }
  }
}

export const environmentalReportsService = new EnvironmentalReportsService();
