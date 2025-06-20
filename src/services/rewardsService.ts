import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  increment,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress: number;
  color: string;
  earnedDate?: string;
  category: 'transport' | 'energy' | 'waste' | 'general';
  requirement: {
    type: 'count' | 'total' | 'percentage';
    value: number;
    metric: string;
  };
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: number; // Green points
  deadline: string;
  progress: number;
  total: number;
  status: 'active' | 'completed' | 'upcoming' | 'expired';
  category: string;
  participants: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  points: number;
  badge: string;
  totalCO2Saved: number;
  activityStreak: number;
}

export interface UserRewards {
  userId: string;
  greenPoints: number;
  weeklyPoints: number;
  totalCO2Saved: number;
  badgesEarned: string[];
  activeChallenges: string[];
  completedChallenges: string[];
  activityStreak: number;
  level: number;
  nextLevelPoints: number;
  lastUpdated: string;
}

class RewardsService {
  // Default badges configuration
  private defaultBadges: Omit<Badge, 'id' | 'earned' | 'progress' | 'earnedDate'>[] = [
    {
      name: 'Eco Warrior',
      description: 'Complete 50 carbon reduction activities',
      icon: 'Trophy',
      color: 'bg-yellow-500',
      category: 'general',
      requirement: { type: 'count', value: 50, metric: 'carbonEntries' }
    },
    {
      name: 'Green Commuter',
      description: 'Use eco-friendly transport 30 times',
      icon: 'Leaf',
      color: 'bg-green-500',
      category: 'transport',
      requirement: { type: 'count', value: 30, metric: 'transportEntries' }
    },
    {
      name: 'Energy Saver',
      description: 'Reduce energy consumption by 25%',
      icon: 'Zap',
      color: 'bg-blue-500',
      category: 'energy',
      requirement: { type: 'percentage', value: 25, metric: 'energyReduction' }
    },
    {
      name: 'Waste Reducer',
      description: 'Recycle 100kg of waste',
      icon: 'Recycle',
      color: 'bg-purple-500',
      category: 'waste',
      requirement: { type: 'total', value: 100, metric: 'wasteRecycled' }
    },
    {
      name: 'Carbon Neutral',
      description: 'Achieve net-zero carbon footprint',
      icon: 'Target',
      color: 'bg-emerald-500',
      category: 'general',
      requirement: { type: 'total', value: 0, metric: 'netCarbonFootprint' }
    },
    {
      name: 'Eco Legend',
      description: 'Save 1000kg CO₂ in total',
      icon: 'Star',
      color: 'bg-indigo-500',
      category: 'general',
      requirement: { type: 'total', value: 1000, metric: 'totalCO2Saved' }
    }
  ];

  // Get user rewards data
  async getUserRewards(userId: string): Promise<UserRewards | null> {
    try {
      const userDoc = await getDocs(
        query(collection(db, 'userRewards'), where('userId', '==', userId), limit(1))
      );

      if (!userDoc.empty) {
        const data = userDoc.docs[0].data();
        return {
          userId,
          greenPoints: data.greenPoints || 0,
          weeklyPoints: data.weeklyPoints || 0,
          totalCO2Saved: data.totalCO2Saved || 0,
          badgesEarned: data.badgesEarned || [],
          activeChallenges: data.activeChallenges || [],
          completedChallenges: data.completedChallenges || [],
          activityStreak: data.activityStreak || 0,
          level: data.level || 1,
          nextLevelPoints: data.nextLevelPoints || 500,
          lastUpdated: data.lastUpdated || new Date().toISOString()
        };
      }

      // Create initial rewards data
      return await this.initializeUserRewards(userId);
    } catch (error) {
      console.error('Error getting user rewards:', error);
      return null;
    }
  }

  // Initialize user rewards
  async initializeUserRewards(userId: string): Promise<UserRewards> {
    const initialRewards: Omit<UserRewards, 'userId'> = {
      greenPoints: 100,
      weeklyPoints: 0,
      totalCO2Saved: 0,
      badgesEarned: ['newcomer'],
      activeChallenges: [],
      completedChallenges: [],
      activityStreak: 0,
      level: 1,
      nextLevelPoints: 500,
      lastUpdated: new Date().toISOString()
    };

    await addDoc(collection(db, 'userRewards'), {
      userId,
      ...initialRewards
    });

    return { userId, ...initialRewards };
  }

  // Subscribe to user rewards updates
  subscribeToUserRewards(userId: string, callback: (rewards: UserRewards | null) => void) {
    const q = query(
      collection(db, 'userRewards'),
      where('userId', '==', userId),
      limit(1)
    );

    return onSnapshot(q, (querySnapshot) => {
      if (querySnapshot.empty) {
        callback(null);
        return;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      callback({
        userId,
        greenPoints: data.greenPoints || 0,
        weeklyPoints: data.weeklyPoints || 0,
        totalCO2Saved: data.totalCO2Saved || 0,
        badgesEarned: data.badgesEarned || [],
        activeChallenges: data.activeChallenges || [],
        completedChallenges: data.completedChallenges || [],
        activityStreak: data.activityStreak || 0,
        level: data.level || 1,
        nextLevelPoints: data.nextLevelPoints || 500,
        lastUpdated: data.lastUpdated || new Date().toISOString()
      });
    });
  }

  // Get user badges with progress
  async getUserBadges(userId: string, carbonEntries: any[]): Promise<Badge[]> {
    try {
      const userRewards = await this.getUserRewards(userId);
      const earnedBadges = userRewards?.badgesEarned || [];

      return this.defaultBadges.map((badge, index) => {
        const badgeId = `badge_${index}`;
        const isEarned = earnedBadges.includes(badgeId);
        const progress = this.calculateBadgeProgress(badge, carbonEntries, userRewards);

        return {
          id: badgeId,
          ...badge,
          earned: isEarned,
          progress: isEarned ? 100 : progress,
          earnedDate: isEarned ? userRewards?.lastUpdated : undefined
        };
      });
    } catch (error) {
      console.error('Error getting user badges:', error);
      return [];
    }
  }

  // Calculate badge progress
  private calculateBadgeProgress(badge: Omit<Badge, 'id' | 'earned' | 'progress' | 'earnedDate'>, carbonEntries: any[], userRewards: UserRewards | null): number {
    if (!userRewards) return 0;

    const { requirement } = badge;
    let currentValue = 0;

    switch (requirement.metric) {
      case 'carbonEntries':
        currentValue = carbonEntries.length;
        break;
      case 'transportEntries':
        currentValue = carbonEntries.filter(entry => entry.category === 'transport').length;
        break;
      case 'totalCO2Saved':
        currentValue = userRewards.totalCO2Saved;
        break;
      case 'wasteRecycled':
        currentValue = carbonEntries
          .filter(entry => entry.category === 'waste')
          .reduce((sum, entry) => sum + (entry.amount || 0), 0);
        break;
      default:
        currentValue = 0;
    }

    if (requirement.type === 'percentage') {
      // For percentage-based requirements, we need baseline data
      return Math.min(100, (currentValue / requirement.value) * 100);
    }

    return Math.min(100, (currentValue / requirement.value) * 100);
  }

  // Get leaderboard
  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const q = query(
        collection(db, 'users'),
        orderBy('greenPoints', 'desc'),
        orderBy('totalCO2Saved', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const leaderboard: LeaderboardEntry[] = [];

      querySnapshot.docs.slice(0, limit).forEach((doc, index) => {
        const data = doc.data();
        leaderboard.push({
          rank: index + 1,
          userId: doc.id,
          displayName: data.displayName || 'Anonymous',
          points: data.greenPoints || 0,
          badge: index < 3 ? ['🏆', '🥈', '🥉'][index] : '',
          totalCO2Saved: data.totalCO2Saved || 0,
          activityStreak: data.activityStreak || 0
        });
      });

      return leaderboard;
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  // Subscribe to leaderboard updates
  subscribeToLeaderboard(callback: (leaderboard: LeaderboardEntry[]) => void, limitCount: number = 10) {
    const q = query(
      collection(db, 'users'),
      orderBy('greenPoints', 'desc'),
      orderBy('totalCO2Saved', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const leaderboard: LeaderboardEntry[] = [];

      querySnapshot.docs.slice(0, limitCount).forEach((doc, index) => {
        const data = doc.data();
        leaderboard.push({
          rank: index + 1,
          userId: doc.id,
          displayName: data.displayName || 'Anonymous',
          points: data.greenPoints || 0,
          badge: index < 3 ? ['🏆', '🥈', '🥉'][index] : '',
          totalCO2Saved: data.totalCO2Saved || 0,
          activityStreak: data.activityStreak || 0
        });
      });

      callback(leaderboard);
    });
  }

  // Get active challenges
  async getActiveChallenges(): Promise<Challenge[]> {
    try {
      const now = new Date();
      const q = query(
        collection(db, 'challenges'),
        where('deadline', '>', now.toISOString()),
        orderBy('deadline', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const challenges: Challenge[] = [];

      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        const deadline = new Date(data.deadline);
        const isActive = deadline > now;

        challenges.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          reward: data.reward || 50,
          deadline: data.deadline,
          progress: data.progress || 0,
          total: data.total || 100,
          status: isActive ? 'active' : 'expired',
          category: data.category || 'general',
          participants: data.participants || 0
        });
      });

      return challenges;
    } catch (error) {
      console.error('Error getting challenges:', error);
      return this.getDefaultChallenges();
    }
  }

  // Get default challenges if none exist
  private getDefaultChallenges(): Challenge[] {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return [
      {
        id: 'walk_week',
        title: 'Walk Week Challenge',
        description: 'Walk or cycle instead of driving for 7 days',
        reward: 50,
        deadline: nextWeek.toISOString(),
        progress: Math.floor(Math.random() * 5),
        total: 7,
        status: 'active',
        category: 'transport',
        participants: 156
      },
      {
        id: 'energy_sprint',
        title: 'Energy Efficiency Sprint',
        description: 'Reduce home energy usage by 20%',
        reward: 75,
        deadline: nextMonth.toISOString(),
        progress: Math.floor(Math.random() * 15),
        total: 20,
        status: 'active',
        category: 'energy',
        participants: 89
      },
      {
        id: 'plastic_free',
        title: 'Plastic-Free Week',
        description: 'Avoid single-use plastics for 7 days',
        reward: 60,
        deadline: nextWeek.toISOString(),
        progress: Math.floor(Math.random() * 3),
        total: 7,
        status: 'active',
        category: 'waste',
        participants: 203
      }
    ];
  }

  // Subscribe to challenges updates
  subscribeToChallenges(callback: (challenges: Challenge[]) => void) {
    const now = new Date();
    const q = query(
      collection(db, 'challenges'),
      where('deadline', '>', now.toISOString()),
      orderBy('deadline', 'asc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const challenges: Challenge[] = [];

      if (querySnapshot.empty) {
        callback(this.getDefaultChallenges());
        return;
      }

      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        const deadline = new Date(data.deadline);
        const isActive = deadline > now;

        challenges.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          reward: data.reward || 50,
          deadline: data.deadline,
          progress: data.progress || 0,
          total: data.total || 100,
          status: isActive ? 'active' : 'expired',
          category: data.category || 'general',
          participants: data.participants || 0
        });
      });

      callback(challenges.length > 0 ? challenges : this.getDefaultChallenges());
    });
  }

  // Award points for completing activities
  async awardPoints(userId: string, points: number, activity: string): Promise<void> {
    try {
      const userRewardsQuery = query(
        collection(db, 'userRewards'),
        where('userId', '==', userId),
        limit(1)
      );

      const userRewardsSnapshot = await getDocs(userRewardsQuery);

      if (!userRewardsSnapshot.empty) {
        const docRef = userRewardsSnapshot.docs[0].ref;
        await updateDoc(docRef, {
          greenPoints: increment(points),
          weeklyPoints: increment(points),
          lastUpdated: new Date().toISOString()
        });
      }

      // Also update the main user document
      await updateDoc(doc(db, 'users', userId), {
        greenPoints: increment(points),
        lastActivity: new Date().toISOString()
      });

      console.log(`Awarded ${points} points to user ${userId} for ${activity}`);
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  }

  // Check and award badges
  async checkAndAwardBadges(userId: string, carbonEntries: any[]): Promise<string[]> {
    try {
      const userBadges = await this.getUserBadges(userId, carbonEntries);
      const newBadges: string[] = [];

      for (const badge of userBadges) {
        if (!badge.earned && badge.progress >= 100) {
          // Award the badge
          const userRewardsQuery = query(
            collection(db, 'userRewards'),
            where('userId', '==', userId),
            limit(1)
          );

          const userRewardsSnapshot = await getDocs(userRewardsQuery);

          if (!userRewardsSnapshot.empty) {
            const docRef = userRewardsSnapshot.docs[0].ref;
            const currentData = userRewardsSnapshot.docs[0].data();
            const updatedBadges = [...(currentData.badgesEarned || []), badge.id];

            await updateDoc(docRef, {
              badgesEarned: updatedBadges,
              lastUpdated: new Date().toISOString()
            });

            newBadges.push(badge.name);

            // Award bonus points for earning badge
            await this.awardPoints(userId, 100, `earning ${badge.name} badge`);
          }
        }
      }

      return newBadges;
    } catch (error) {
      console.error('Error checking badges:', error);
      return [];
    }
  }
}

export const rewardsService = new RewardsService();
