
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import ModernLayout from '@/components/ModernLayout';
import Auth from '@/components/Auth';
import Dashboard from '@/components/Dashboard';
import CarbonCalculator from '@/components/CarbonCalculator';
import Gamification from '@/components/Gamification';
import Profile from '@/components/Profile';
import DailyTip from '@/components/DailyTip';
import Suggestions from '@/components/Suggestions';
import Reports from '@/components/Reports';
import ChatBot from '@/components/ChatBot';
import { PageLoading } from '@/components/ui/loading';
import { auth } from '@/lib/firebase';
import { authService, UserProfile } from '@/services/authService';
import { carbonService } from '@/services/carbonService';

const Index = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [carbonEntries, setCarbonEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChatBotMinimized, setIsChatBotMinimized] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed, user:', firebaseUser?.uid || 'null');
      setIsLoading(true);

      try {
        if (firebaseUser) {
          console.log('Firebase user detected:', firebaseUser.uid);

          // Get or create user profile from Firestore
          let userProfile = await authService.getUserProfile(firebaseUser.uid);

          // If no profile exists, create one (for existing users or OAuth users)
          if (!userProfile) {
            console.log('No user profile found, creating one...');
            userProfile = await authService.createUserProfile(firebaseUser.uid, {
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || 'Eco Warrior',
              photoURL: firebaseUser.photoURL || undefined
            });
          }

          setUser(userProfile);

          // Load user's carbon entries
          try {
            const entries = await carbonService.getUserCarbonEntries(firebaseUser.uid);
            setCarbonEntries(entries);
            console.log('Carbon entries loaded:', entries.length);
          } catch (error) {
            console.error('Error loading carbon entries:', error);
            setCarbonEntries([]);
          }

          console.log('User profile loaded:', userProfile);
        } else {
          // User is signed out
          console.log('No Firebase user detected');
          setUser(null);
          setCarbonEntries([]);
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);

        if (firebaseUser) {
          // Set basic user info even if Firestore fails
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || 'User',
            greenPoints: 0,
            totalCO2Saved: 0,
            joinedDate: new Date().toISOString(),
            weeklyTarget: 20,
            monthlyTarget: 80,
            badgesEarned: [],
            activityStreak: 0,
            preferences: {
              emailNotifications: true,
              weeklyReports: true,
              dailyTips: true
            }
          });
          setCarbonEntries([]);
        } else {
          setUser(null);
          setCarbonEntries([]);
        }
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (userData: UserProfile) => {
    setUser(userData);
    // Load user's carbon entries
    try {
      const entries = await carbonService.getUserCarbonEntries(userData.uid);
      setCarbonEntries(entries);
      console.log('Carbon entries loaded after login:', entries.length);
    } catch (error) {
      console.error('Error loading carbon entries after login:', error);
      setCarbonEntries([]);
    }
    console.log('User logged in:', userData);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setCarbonEntries([]);
      console.log('User logged out');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAddCarbonEntry = async (entry: any) => {
    if (!user) return;

    try {
      console.log('Adding carbon entry:', entry);
      const entryId = await carbonService.addCarbonEntry({
        ...entry,
        userId: user.uid,
        date: new Date().toISOString()
      });

      const newEntry = {
        ...entry,
        id: entryId,
        userId: user.uid,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      setCarbonEntries(prev => {
        const updated = [newEntry, ...prev];
        console.log('Updated carbon entries count:', updated.length);
        return updated;
      });

      // Update user's green points and total CO2 saved
      const points = Math.floor(entry.co2Emission * 2);
      const updatedUser = {
        ...user,
        greenPoints: user.greenPoints + points,
        totalCO2Saved: user.totalCO2Saved + entry.co2Emission,
        lastActivity: new Date().toISOString()
      };

      setUser(updatedUser);

      console.log('Carbon entry added successfully:', {
        entryId,
        co2Emission: entry.co2Emission,
        newTotalEntries: carbonEntries.length + 1,
        userPoints: updatedUser.greenPoints,
        userTotalCO2: updatedUser.totalCO2Saved
      });
    } catch (error) {
      console.error('Error adding carbon entry:', error);
    }
  };

  const handleUpdateProfile = async (profileData: any) => {
    if (!user) return;

    try {
      await authService.updateUserProfile(user.uid, profileData);
      setUser(prev => ({ ...prev, ...profileData }));
      console.log('Profile updated:', profileData);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  if (isLoading) {
    return <PageLoading />;
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <ModernLayout user={user} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={<Dashboard user={user} carbonEntries={carbonEntries} />}
        />
        <Route
          path="/calculator"
          element={<CarbonCalculator onAddEntry={handleAddCarbonEntry} />}
        />
        <Route path="/reports" element={<Reports user={user} carbonEntries={carbonEntries} />} />
        <Route path="/suggestions" element={<Suggestions user={user} carbonEntries={carbonEntries} />} />
        <Route path="/gamification" element={<Gamification user={user} carbonEntries={carbonEntries} />} />
        <Route
          path="/profile"
          element={<Profile user={user} onUpdateProfile={handleUpdateProfile} />}
        />
        <Route path="/daily-tip" element={<DailyTip />} />
      </Routes>

      {/* Dialogflow ChatBot */}
      <ChatBot
        isMinimized={isChatBotMinimized}
        onToggleMinimize={() => setIsChatBotMinimized(!isChatBotMinimized)}
      />
    </ModernLayout>
  );
};

export default Index;
