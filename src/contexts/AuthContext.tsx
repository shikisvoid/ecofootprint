// Authentication Context for EcoCloudApp
// Provides user authentication state throughout the application

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { authService, UserProfile } from '@/services/authService';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: UserProfile) => void;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed in context, user:', firebaseUser?.uid || 'null');
      setIsLoading(true);
      setFirebaseUser(firebaseUser);

      try {
        if (firebaseUser) {
          console.log('Firebase user detected in context:', firebaseUser.uid);

          // Get or create user profile from Firestore
          let userProfile = await authService.getUserProfile(firebaseUser.uid);

          // If no profile exists, create one (for existing users or OAuth users)
          if (!userProfile) {
            console.log('No user profile found in context, creating one...');
            userProfile = await authService.createUserProfile(firebaseUser.uid, {
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || 'Eco Warrior',
              photoURL: firebaseUser.photoURL || undefined
            });
          }

          setUser(userProfile);
          console.log('User profile loaded in context:', userProfile);
        } else {
          // User is signed out
          console.log('No Firebase user detected in context');
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth context state change handler:', error);

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
        } else {
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = (userData: UserProfile) => {
    setUser(userData);
    console.log('User logged in via context:', userData);
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setFirebaseUser(null);
      console.log('User logged out via context');
    } catch (error) {
      console.error('Logout error in context:', error);
      throw error;
    }
  };

  const updateUser = (userData: Partial<UserProfile>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      console.log('User updated in context:', userData);
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
