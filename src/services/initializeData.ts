import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Initialize default challenges if none exist
export const initializeDefaultChallenges = async () => {
  try {
    // Check if challenges already exist
    const challengesQuery = query(collection(db, 'challenges'));
    const existingChallenges = await getDocs(challengesQuery);
    
    if (!existingChallenges.empty) {
      console.log('Challenges already exist, skipping initialization');
      return;
    }

    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const defaultChallenges = [
      {
        title: 'Walk Week Challenge',
        description: 'Walk or cycle instead of driving for 7 days',
        reward: 50,
        deadline: nextWeek.toISOString(),
        progress: 0,
        total: 7,
        status: 'active',
        category: 'transport',
        participants: 156,
        createdAt: now.toISOString()
      },
      {
        title: 'Energy Efficiency Sprint',
        description: 'Reduce home energy usage by 20%',
        reward: 75,
        deadline: nextMonth.toISOString(),
        progress: 0,
        total: 20,
        status: 'active',
        category: 'energy',
        participants: 89,
        createdAt: now.toISOString()
      },
      {
        title: 'Plastic-Free Week',
        description: 'Avoid single-use plastics for 7 days',
        reward: 60,
        deadline: twoWeeks.toISOString(),
        progress: 0,
        total: 7,
        status: 'active',
        category: 'waste',
        participants: 203,
        createdAt: now.toISOString()
      },
      {
        title: 'Green Transport Month',
        description: 'Use eco-friendly transport for 30 days',
        reward: 100,
        deadline: nextMonth.toISOString(),
        progress: 0,
        total: 30,
        status: 'active',
        category: 'transport',
        participants: 67,
        createdAt: now.toISOString()
      },
      {
        title: 'Zero Waste Weekend',
        description: 'Produce zero waste for 2 days',
        reward: 40,
        deadline: nextWeek.toISOString(),
        progress: 0,
        total: 2,
        status: 'active',
        category: 'waste',
        participants: 134,
        createdAt: now.toISOString()
      }
    ];

    // Add challenges to Firestore
    for (const challenge of defaultChallenges) {
      await addDoc(collection(db, 'challenges'), challenge);
      console.log(`Added challenge: ${challenge.title}`);
    }

    console.log('✅ Default challenges initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing default challenges:', error);
  }
};

// Initialize sample leaderboard data
export const initializeSampleUsers = async () => {
  try {
    // Check if sample users already exist
    const usersQuery = query(collection(db, 'users'), where('displayName', 'in', ['Sarah Green', 'Mike Eco', 'Anna Forest', 'John Earth']));
    const existingUsers = await getDocs(usersQuery);
    
    if (!existingUsers.empty) {
      console.log('Sample users already exist, skipping initialization');
      return;
    }

    const sampleUsers = [
      {
        uid: 'sample_user_1',
        email: 'sarah.green@example.com',
        displayName: 'Sarah Green',
        greenPoints: 2450,
        totalCO2Saved: 125.5,
        joinedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
        carbonTarget: 50,
        weeklyTarget: 20,
        monthlyTarget: 80,
        badgesEarned: ['eco_warrior', 'green_commuter', 'energy_saver'],
        activityStreak: 15,
        lastActivity: new Date().toISOString()
      },
      {
        uid: 'sample_user_2',
        email: 'mike.eco@example.com',
        displayName: 'Mike Eco',
        greenPoints: 2380,
        totalCO2Saved: 119.0,
        joinedDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(), // 75 days ago
        carbonTarget: 50,
        weeklyTarget: 20,
        monthlyTarget: 80,
        badgesEarned: ['eco_warrior', 'green_commuter'],
        activityStreak: 12,
        lastActivity: new Date().toISOString()
      },
      {
        uid: 'sample_user_3',
        email: 'anna.forest@example.com',
        displayName: 'Anna Forest',
        greenPoints: 2100,
        totalCO2Saved: 105.0,
        joinedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
        carbonTarget: 50,
        weeklyTarget: 20,
        monthlyTarget: 80,
        badgesEarned: ['eco_warrior'],
        activityStreak: 8,
        lastActivity: new Date().toISOString()
      },
      {
        uid: 'sample_user_4',
        email: 'john.earth@example.com',
        displayName: 'John Earth',
        greenPoints: 1950,
        totalCO2Saved: 97.5,
        joinedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
        carbonTarget: 50,
        weeklyTarget: 20,
        monthlyTarget: 80,
        badgesEarned: ['green_commuter'],
        activityStreak: 5,
        lastActivity: new Date().toISOString()
      }
    ];

    // Add sample users to Firestore
    for (const user of sampleUsers) {
      await addDoc(collection(db, 'users'), user);
      console.log(`Added sample user: ${user.displayName}`);
    }

    console.log('✅ Sample users initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing sample users:', error);
  }
};

// Initialize all default data
export const initializeDefaultData = async () => {
  console.log('🚀 Initializing default data...');
  await initializeDefaultChallenges();
  await initializeSampleUsers();
  console.log('✅ Default data initialization complete');
};
