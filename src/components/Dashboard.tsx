import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { StatCard, AnimatedCard, ProgressCard } from '@/components/ui/animated-card';
import { StatSkeleton, ButtonLoading } from '@/components/ui/loading';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { Leaf, Trophy, Target, TrendingDown, Calendar, Activity, RefreshCw, Zap, Award } from 'lucide-react';
import { carbonService, DashboardStats } from '@/services/carbonService';
import { UserProfile } from '@/services/authService';


interface DashboardProps {
  user?: UserProfile;
  carbonEntries?: any[];
}

const Dashboard = ({ user, carbonEntries = [] }: DashboardProps) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEntries: 0,
    totalCO2Saved: 0,
    weeklyProgress: 0,
    monthlyEmissions: [],
    categoryBreakdown: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.uid) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log('Loading dashboard data for user:', user.uid, 'with', carbonEntries.length, 'entries');



        const dashboardStats = await carbonService.getDashboardStats(user.uid);
        setStats(dashboardStats);
        console.log('Dashboard stats loaded:', dashboardStats);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Set empty stats instead of keeping loading state
        setStats({
          totalEntries: 0,
          totalCO2Saved: 0,
          weeklyProgress: 0,
          monthlyEmissions: [],
          categoryBreakdown: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.uid, carbonEntries.length]);

  const handleRefresh = async () => {
    if (!user?.uid) return;

    setIsRefreshing(true);
    try {
      console.log('Manually refreshing dashboard data...');
      const dashboardStats = await carbonService.getDashboardStats(user.uid);
      setStats(dashboardStats);
      console.log('Dashboard refreshed:', dashboardStats);
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate dashboard metrics from real user data with fallbacks
  const dashboardMetrics = [
    {
      title: 'CO₂ Tracked This Month',
      value: `${(stats.totalCO2Saved || 0).toFixed(1)} kg`,
      icon: Leaf,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: `${stats.totalEntries || 0} entries`,
      progress: user?.monthlyTarget ? ((stats.totalCO2Saved || 0) / user.monthlyTarget) * 100 : 0
    },
    {
      title: 'Green Points',
      value: user?.greenPoints || 0,
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      change: `+${Math.floor((user?.greenPoints || 0) / 50)} level`,
      streak: user?.activityStreak || 0
    },
    {
      title: 'Weekly Progress',
      value: `${stats.weeklyProgress || 0}%`,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: (stats.weeklyProgress || 0) >= 75 ? 'On track' : 'Needs attention',
      target: user?.weeklyTarget || 20
    },
    {
      title: 'Total Tracked',
      value: `${(stats.totalCO2Saved || 0).toFixed(1)} kg`,
      icon: TrendingDown,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: 'All time',
      badges: user?.badgesEarned?.length || 0
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <AnimatedCard className="p-8">
          <div className="space-y-4">
            <div className="h-10 w-96 bg-gradient-to-r from-green-200 to-emerald-200 dark:from-green-800 dark:to-emerald-800 rounded-lg animate-pulse" />
            <div className="h-6 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </AnimatedCard>

        <StatSkeleton count={4} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatedCard className="p-6">
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          </AnimatedCard>
          <AnimatedCard className="p-6">
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          </AnimatedCard>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-xl text-gray-600">Please log in to view your dashboard</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <AnimatedCard className="p-8 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 dark:from-green-400/10 dark:via-emerald-400/10 dark:to-teal-400/10 border-green-200/50 dark:border-green-700/50">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
              Welcome back, {user.displayName || 'Eco Warrior'}! 🌱
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Here's your carbon footprint tracking overview
            </p>
            {user.activityStreak && user.activityStreak > 0 && (
              <div className="flex items-center space-x-2 bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full w-fit">
                <span className="text-orange-600 dark:text-orange-400 font-medium text-sm">
                  🔥 {user.activityStreak} day streak! Keep tracking!
                </span>
              </div>
            )}
          </div>
          <ButtonLoading
            onClick={handleRefresh}
            loading={isRefreshing}
            className="bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </ButtonLoading>
        </div>
      </AnimatedCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="CO₂ Tracked This Month"
          value={`${(stats.totalCO2Saved || 0).toFixed(1)} kg`}
          subtitle={`${stats.totalEntries || 0} entries`}
          icon={<Leaf size={20} />}
          color="green"
          trend={stats.totalCO2Saved > 0 ? "up" : "neutral"}
          trendValue={user?.monthlyTarget ? `${Math.min(((stats.totalCO2Saved || 0) / user.monthlyTarget) * 100, 100).toFixed(1)}% of target` : undefined}
        />

        <StatCard
          title="Green Points"
          value={user?.greenPoints || 0}
          subtitle={`Level ${Math.floor((user?.greenPoints || 0) / 100) + 1}`}
          icon={<Trophy size={20} />}
          color="orange"
          trend="up"
          trendValue={user?.activityStreak ? `${user.activityStreak} day streak` : undefined}
        />

        <StatCard
          title="Weekly Progress"
          value={`${stats.weeklyProgress || 0}%`}
          subtitle={(stats.weeklyProgress || 0) >= 75 ? 'On track' : 'Needs attention'}
          icon={<Target size={20} />}
          color="blue"
          trend={(stats.weeklyProgress || 0) >= 75 ? "up" : "down"}
          trendValue={`Target: ${user?.weeklyTarget || 20}kg`}
        />

        <StatCard
          title="Badges Earned"
          value={user?.badgesEarned?.length || 0}
          subtitle="Achievements unlocked"
          icon={<Award size={20} />}
          color="purple"
          trend={user?.badgesEarned?.length ? "up" : "neutral"}
          trendValue="All time"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly CO₂ Tracking Trend */}
        <AnimatedCard className="p-6" gradient>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              Monthly CO₂ Tracking Trend
            </h3>
          </div>
          <div>
            {stats.monthlyEmissions && stats.monthlyEmissions.length > 0 ? (
              <ChartContainer
                config={{
                  emissions: {
                    label: "CO₂ Tracked",
                    color: "#22c55e",
                  },
                  target: {
                    label: "Target",
                    color: "#ef4444",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.monthlyEmissions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="emissions" 
                      stroke="#22c55e" 
                      strokeWidth={3}
                      dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                      name="CO₂ Tracked (kg)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="#ef4444" 
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      name="Target (kg)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Start tracking your carbon footprint to see trends!</p>
                  <p className="text-sm mt-1">Add your first carbon entry to begin.</p>
                </div>
              </div>
            )}
          </div>
        </AnimatedCard>

        {/* Category Breakdown */}
        <AnimatedCard className="p-6" gradient>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-purple-500" />
              Tracking by Category
            </h3>
          </div>
          <div>
            {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 ? (
              <>
                <ChartContainer
                  config={{
                    transport: { label: "Transport", color: "#ef4444" },
                    energy: { label: "Energy", color: "#f97316" },
                    food: { label: "Food", color: "#eab308" },
                    waste: { label: "Waste", color: "#22c55e" },
                    water: { label: "Water", color: "#3b82f6" },
                    shopping: { label: "Shopping", color: "#8b5cf6" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        content={<ChartTooltipContent nameKey="name" />} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {stats.categoryBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-muted-foreground">{item.name} ({item.value}kg)</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <TrendingDown className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Add carbon entries to see category breakdown!</p>
                  <p className="text-sm mt-1">Track different activities to view insights.</p>
                </div>
              </div>
            )}
          </div>
        </AnimatedCard>
      </div>

      {/* Weekly Tracking Progress */}
      <ProgressCard
        title="Weekly Tracking Progress"
        progress={stats.totalCO2Saved || 0}
        total={user?.weeklyTarget || 20}
        unit="kg CO₂"
        color="green"
        className="mb-6"
      />

      <AnimatedCard className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Detailed Weekly Progress
          </h3>
        </div>
        <div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Weekly Tracking Goal</span>
              <span className="text-sm text-muted-foreground">
                {(stats.totalCO2Saved || 0).toFixed(1)}/{user.weeklyTarget || 20} kg CO₂ tracked
              </span>
            </div>
            <Progress value={Math.min(stats.weeklyProgress || 0, 100)} className="h-4" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress: {stats.weeklyProgress || 0}%</span>
              <span className={`font-medium ${(stats.weeklyProgress || 0) >= 75 ? 'text-green-600' : 'text-orange-600'}`}>
                {(stats.weeklyProgress || 0) >= 75 ? '🎯 On Track!' : '📈 Keep Going!'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {(stats.weeklyProgress || 0) >= 75
                ? "Excellent! You're actively tracking your carbon footprint this week! 🌱"
                : "Add more carbon tracking entries to reach your weekly goal! Every entry counts! 💪"
              }
            </p>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
};

export default Dashboard;
