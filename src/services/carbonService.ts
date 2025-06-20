
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { rewardsService } from './rewardsService';

export interface CarbonEntry {
  id?: string;
  userId: string;
  category: string;
  activity: string;
  amount: number;
  co2Emission: number;
  date: string;
  createdAt: string;
}

export interface DashboardStats {
  totalEntries: number;
  totalCO2Saved: number;
  weeklyProgress: number;
  monthlyEmissions: { month: string; emissions: number; target: number }[];
  categoryBreakdown: { name: string; value: number; color: string }[];
}

export const carbonService = {
  // Test Firebase connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing Firebase connection...');
      const testQuery = query(collection(db, 'carbonEntries'));
      await getDocs(testQuery);
      console.log('Firebase connection successful');
      return true;
    } catch (error) {
      console.error('Firebase connection failed:', error);
      return false;
    }
  },

  // Add new carbon entry
  async addCarbonEntry(entry: Omit<CarbonEntry, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'carbonEntries'), {
        ...entry,
        createdAt: new Date().toISOString()
      });

      // Update user's total CO2 saved and green points
      const points = Math.floor(entry.co2Emission * 2); // 2 points per kg CO2
      try {
        await updateDoc(doc(db, 'users', entry.userId), {
          totalCO2Saved: increment(entry.co2Emission),
          greenPoints: increment(points),
          lastActivity: new Date().toISOString()
        });

        // Award points through rewards service
        await rewardsService.awardPoints(
          entry.userId,
          points,
          `tracking ${entry.activity} (${entry.category})`
        );

        // Check for new badges
        const allEntries = await this.getUserCarbonEntries(entry.userId);
        const newBadges = await rewardsService.checkAndAwardBadges(entry.userId, allEntries);

        if (newBadges.length > 0) {
          console.log(`🏆 New badges earned: ${newBadges.join(', ')}`);
        }

      } catch (userUpdateError) {
        console.warn('Failed to update user stats, but entry was saved:', userUpdateError);
      }

      console.log('Carbon entry added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding carbon entry:', error);
      throw error;
    }
  },

  // Get user's carbon entries
  async getUserCarbonEntries(userId: string): Promise<CarbonEntry[]> {
    try {
      console.log('Fetching carbon entries for user:', userId);

      // Try simple query first to avoid index issues
      const q = query(
        collection(db, 'carbonEntries'),
        where('userId', '==', userId)
      );

      console.log('Executing Firestore query...');
      const querySnapshot = await getDocs(q);
      const entries: CarbonEntry[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Found entry:', doc.id, data);
        entries.push({ id: doc.id, ...data } as CarbonEntry);
      });

      // Sort by createdAt descending (newest first)
      entries.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date);
        const dateB = new Date(b.createdAt || b.date);
        return dateB.getTime() - dateA.getTime();
      });

      console.log('Fetched carbon entries:', entries.length, entries);
      return entries;
    } catch (error) {
      console.error('Error getting carbon entries:', error);
      console.error('Error details:', {
        code: (error as any)?.code,
        message: (error as any)?.message,
        userId
      });
      // Return empty array instead of throwing error to prevent app crashes
      return [];
    }
  },

  // Get dashboard statistics
  async getDashboardStats(userId: string): Promise<DashboardStats> {
    try {
      const entries = await this.getUserCarbonEntries(userId);
      console.log('Raw entries for dashboard:', entries.length);

      // Calculate monthly emissions for the last 6 months
      const monthlyData = this.calculateMonthlyEmissions(entries);

      // Calculate current month's CO2 tracked
      const now = new Date();
      const currentMonthEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === now.getMonth() &&
               entryDate.getFullYear() === now.getFullYear();
      });

      // Calculate category breakdown for current month only
      const categoryBreakdown = this.calculateCategoryBreakdown(currentMonthEntries);

      // Calculate weekly progress (last 7 days)
      const weeklyProgress = this.calculateWeeklyProgress(entries);

      const currentMonthCO2 = currentMonthEntries.reduce((total, entry) => total + entry.co2Emission, 0);
      const totalCO2Saved = entries.reduce((total, entry) => total + entry.co2Emission, 0);

      console.log('Dashboard stats calculated:', {
        totalEntries: entries.length,
        currentMonthEntries: currentMonthEntries.length,
        currentMonthCO2,
        totalCO2Saved,
        weeklyProgress,
        monthlyEmissions: monthlyData.length,
        categoryBreakdown: categoryBreakdown.length
      });

      return {
        totalEntries: currentMonthEntries.length, // Show current month entries count
        totalCO2Saved: currentMonthCO2, // Show current month CO2, not total
        weeklyProgress,
        monthlyEmissions: monthlyData,
        categoryBreakdown
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        totalEntries: 0,
        totalCO2Saved: 0,
        weeklyProgress: 0,
        monthlyEmissions: [],
        categoryBreakdown: []
      };
    }
  },

  // Helper: Calculate monthly emissions for the last 6 months
  calculateMonthlyEmissions(entries: CarbonEntry[]) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData: { [key: string]: number } = {};
    
    // Initialize last 6 months with zero values
    const now = new Date();
    const monthKeys: string[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
      monthKeys.push(monthKey);
      monthlyData[monthKey] = 0;
    }

    // Aggregate entries by month
    entries.forEach(entry => {
      const entryDate = new Date(entry.date);
      const monthKey = `${months[entryDate.getMonth()]} ${entryDate.getFullYear()}`;
      
      // Only include if within the last 6 months
      if (monthKeys.includes(monthKey)) {
        monthlyData[monthKey] += entry.co2Emission;
      }
    });

    // Convert to array format for charts, maintaining chronological order
    return monthKeys.map(monthKey => {
      const [monthName] = monthKey.split(' ');
      return {
        month: monthName,
        emissions: Math.round(monthlyData[monthKey] * 100) / 100,
        target: 40 // Default monthly target
      };
    });
  },

  // Helper: Calculate category breakdown
  calculateCategoryBreakdown(entries: CarbonEntry[]) {
    const categories = {
      transport: { name: 'Transport', value: 0, color: '#ef4444' },
      energy: { name: 'Energy', value: 0, color: '#f97316' },
      food: { name: 'Food', value: 0, color: '#eab308' },
      waste: { name: 'Waste', value: 0, color: '#22c55e' },
      water: { name: 'Water', value: 0, color: '#3b82f6' },
      shopping: { name: 'Shopping', value: 0, color: '#8b5cf6' }
    };

    // Aggregate CO2 emissions by category
    entries.forEach(entry => {
      const category = entry.category.toLowerCase();
      if (categories[category as keyof typeof categories]) {
        categories[category as keyof typeof categories].value += entry.co2Emission;
      }
    });

    // Return only categories with values, sorted by value
    return Object.values(categories)
      .filter(cat => cat.value > 0)
      .map(cat => ({
        ...cat,
        value: Math.round(cat.value * 100) / 100
      }))
      .sort((a, b) => b.value - a.value);
  },

  // Helper: Calculate weekly progress (last 7 days)
  calculateWeeklyProgress(entries: CarbonEntry[]): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Filter entries from the last 7 days
    const weeklyEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= oneWeekAgo;
    });

    // Calculate total emissions for the week
    const weeklyEmissions = weeklyEntries.reduce((total, entry) => 
      total + entry.co2Emission, 0
    );

    console.log('Weekly calculation:', {
      weeklyEntries: weeklyEntries.length,
      weeklyEmissions,
      oneWeekAgo: oneWeekAgo.toISOString()
    });

    // Return as percentage of weekly target (20kg default)
    const weeklyTarget = 20;
    return Math.round((weeklyEmissions / weeklyTarget) * 100);
  },

  // Get recent activity for profile page
  async getRecentActivity(userId: string, limit: number = 5): Promise<CarbonEntry[]> {
    try {
      const entries = await this.getUserCarbonEntries(userId);
      return entries.slice(0, limit);
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  },

  // Get category statistics for the current month
  async getCategoryStats(userId: string) {
    try {
      const entries = await this.getUserCarbonEntries(userId);
      
      // Filter for current month
      const now = new Date();
      const currentMonthEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === now.getMonth() && 
               entryDate.getFullYear() === now.getFullYear();
      });

      return this.calculateCategoryBreakdown(currentMonthEntries);
    } catch (error) {
      console.error('Error getting category stats:', error);
      return [];
    }
  }
};
