
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Star, Target, Leaf, Zap, Recycle, Activity, RefreshCw } from 'lucide-react';
import { rewardsService, UserRewards, Badge as BadgeType, Challenge, LeaderboardEntry } from '../services/rewardsService';
import { initializeDefaultData } from '../services/initializeData';
import { UserProfile } from '../services/authService';

interface GamificationProps {
  user?: UserProfile | null;
  carbonEntries?: any[];
}

const Gamification = ({ user, carbonEntries = [] }: GamificationProps) => {
  const { toast } = useToast();

  const [userRewards, setUserRewards] = useState<UserRewards | null>(null);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Load real-time data on component mount
  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    console.log('Loading rewards data for user:', user.uid);

    // Subscribe to user rewards updates
    const unsubscribeRewards = rewardsService.subscribeToUserRewards(
      user.uid,
      (rewards) => {
        console.log('User rewards updated:', rewards);
        setUserRewards(rewards);
        setLastUpdated(new Date());
      }
    );

    // Subscribe to leaderboard updates
    const unsubscribeLeaderboard = rewardsService.subscribeToLeaderboard(
      (leaderboardData) => {
        console.log('Leaderboard updated:', leaderboardData.length);
        // Mark current user in leaderboard
        const updatedLeaderboard = leaderboardData.map(entry => ({
          ...entry,
          name: entry.userId === user.uid ? 'You' : entry.displayName
        }));
        setLeaderboard(updatedLeaderboard);
      },
      10
    );

    // Subscribe to challenges updates
    const unsubscribeChallenges = rewardsService.subscribeToChallenges(
      (challengesData) => {
        console.log('Challenges updated:', challengesData.length);
        setChallenges(challengesData);
      }
    );

    // Load badges
    loadBadges();

    setIsLoading(false);

    return () => {
      unsubscribeRewards();
      unsubscribeLeaderboard();
      unsubscribeChallenges();
    };
  }, [user?.uid]);

  // Reload badges when carbon entries change
  useEffect(() => {
    if (user?.uid && carbonEntries.length > 0) {
      loadBadges();
    }
  }, [user?.uid, carbonEntries.length]);

  // Load user badges
  const loadBadges = async () => {
    if (!user?.uid) return;

    try {
      const userBadges = await rewardsService.getUserBadges(user.uid, carbonEntries);
      setBadges(userBadges);
    } catch (error) {
      console.error('Error loading badges:', error);
    }
  };

  // Refresh all data manually
  const refreshData = async () => {
    if (!user?.uid) {
      toast({
        title: "Error",
        description: "Please log in to refresh data",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      await loadBadges();
      setLastUpdated(new Date());

      toast({
        title: "🔄 Data Refreshed!",
        description: "Rewards and achievements data has been updated"
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Error",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize default data (challenges and sample users)
  const initializeData = async () => {
    try {
      setIsLoading(true);
      await initializeDefaultData();

      toast({
        title: "🚀 Data Initialized!",
        description: "Default challenges and sample users have been added"
      });

      // Refresh data after initialization
      setTimeout(() => {
        setLastUpdated(new Date());
      }, 1000);
    } catch (error) {
      console.error('Error initializing data:', error);
      toast({
        title: "Error",
        description: "Failed to initialize data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get icon component from string
  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Trophy, Star, Target, Leaf, Zap, Recycle
    };
    return icons[iconName] || Trophy;
  };

  // Calculate level progress
  const calculateLevelProgress = () => {
    if (!userRewards) return 0;
    const currentLevelPoints = (userRewards.level - 1) * 500;
    const nextLevelPoints = userRewards.level * 500;
    const progress = ((userRewards.greenPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  // Get level name
  const getLevelName = (level: number) => {
    const levels = [
      'Eco Beginner', 'Eco Enthusiast', 'Eco Warrior', 'Eco Champion',
      'Eco Master', 'Eco Legend', 'Eco Guardian', 'Eco Sage'
    ];
    return levels[Math.min(level - 1, levels.length - 1)] || 'Eco Legend';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-muted-foreground">Loading rewards...</span>
        </div>
      </div>
    );
  }



  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Eco Rewards & Achievements</h1>
            <p className="text-gray-600">Track your progress and earn badges for eco-friendly actions</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={initializeData}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-1"></div>
              ) : (
                <Star size={14} className="mr-1" />
              )}
              Initialize Data
            </Button>
            <Button
              onClick={refreshData}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-1"></div>
              ) : (
                <RefreshCw size={14} className="mr-1" />
              )}
              Refresh
            </Button>
            <Badge variant="outline" className="bg-green-100 text-green-700">
              <Activity size={12} className="mr-1" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Points Summary */}
      <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {userRewards?.greenPoints?.toLocaleString() || 0} Green Points
              </h2>
              <p className="text-green-100">
                +{userRewards?.weeklyPoints || 0} points this week
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-full">
              <Trophy size={32} />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-green-100 mb-2">
              Next level: {getLevelName((userRewards?.level || 1) + 1)} ({Math.max(0, (userRewards?.nextLevelPoints || 500) - (userRewards?.greenPoints || 0))} points to go)
            </p>
            <Progress value={calculateLevelProgress()} className="h-2 bg-green-400" />
          </div>
        </CardContent>
      </Card>

      {/* Badges Grid */}
      <Card className="bg-gradient-to-r from-gray-900 to-yellow-900 border-yellow-600">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="text-yellow-400" size={24} />
            <span className="text-white">Achievements & Badges</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
                  badge.earned
                    ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                    : 'border-border bg-muted'
                }`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded-full ${badge.earned ? badge.color : 'bg-gray-300'}`}>
                    {React.createElement(getIconComponent(badge.icon), {
                      size: 20,
                      className: badge.earned ? 'text-white' : 'text-muted-foreground'
                    })}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${badge.earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {badge.name}
                    </h3>
                    {badge.earned && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                        Earned
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>
                {!badge.earned && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{badge.progress}%</span>
                    </div>
                    <Progress value={badge.progress} className="h-2" />
                  </div>
                )}
                {badge.earned && badge.earnedDate && (
                  <p className="text-xs text-green-600">
                    Earned on {new Date(badge.earnedDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Challenges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="text-blue-500" size={24} />
              <span>Active Challenges</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-foreground">{challenge.title}</h3>
                  <Badge 
                    variant={challenge.status === 'active' ? 'default' : 'secondary'}
                    className={challenge.status === 'active' ? 'bg-blue-100 text-blue-700' : ''}
                  >
                    {challenge.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress: {challenge.progress}/{challenge.total}</span>
                    <span className="font-medium text-green-600">{challenge.reward} Green Points</span>
                  </div>
                  <Progress value={(challenge.progress / challenge.total) * 100} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Deadline: {new Date(challenge.deadline).toLocaleDateString()}</span>
                    <span>{challenge.participants} participants</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="text-yellow-500" size={24} />
              <span>Community Leaderboard</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((user) => (
                <div
                  key={user.rank}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    user.name === 'You' 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border">
                      <span className="font-semibold text-sm">
                        {user.badge || user.rank}
                      </span>
                    </div>
                    <div>
                      <p className={`font-medium ${user.name === 'You' ? 'text-green-700' : 'text-gray-900'}`}>
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500">{user.points} points</p>
                    </div>
                  </div>
                  {user.name === 'You' && (
                    <Badge className="bg-green-100 text-green-700">You</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Gamification;
