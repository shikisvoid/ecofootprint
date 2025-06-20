
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar, MapPin, Leaf, Target, Edit2, Save, X, Bell, Mail, TrendingUp, Trophy } from 'lucide-react';
import { UserProfile } from '@/services/authService';
import { carbonService } from '@/services/carbonService';

interface ProfileProps {
  user?: UserProfile;
  onUpdateProfile?: (data: any) => void;
}

const Profile = ({ user, onUpdateProfile }: ProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    location: user?.location || '',
    carbonGoal: user?.carbonGoal || '',
    weeklyTarget: user?.weeklyTarget || 20,
    monthlyTarget: user?.monthlyTarget || 80,
    preferences: {
      emailNotifications: user?.preferences?.emailNotifications ?? true,
      weeklyReports: user?.preferences?.weeklyReports ?? true,
      dailyTips: user?.preferences?.dailyTips ?? true,
    }
  });

  useEffect(() => {
    setFormData({
      displayName: user?.displayName || '',
      bio: user?.bio || '',
      location: user?.location || '',
      carbonGoal: user?.carbonGoal || '',
      weeklyTarget: user?.weeklyTarget || 20,
      monthlyTarget: user?.monthlyTarget || 80,
      preferences: {
        emailNotifications: user?.preferences?.emailNotifications ?? true,
        weeklyReports: user?.preferences?.weeklyReports ?? true,
        dailyTips: user?.preferences?.dailyTips ?? true,
      }
    });
  }, [user]);

  useEffect(() => {
    const loadActivities = async () => {
      if (!user?.uid) return;

      setIsLoadingActivities(true);
      try {
        const entries = await carbonService.getUserCarbonEntries(user.uid);
        const formattedEntries = entries.map(entry => ({
          id: entry.id,
          date: entry.date,
          action: `${entry.activity} (${entry.category})`,
          impact: `-${entry.co2Emission.toFixed(1)} kg CO₂`,
          points: `+${Math.floor(entry.co2Emission * 2)} points`,
          category: entry.category
        }));

        // Store all activities
        setAllActivities(formattedEntries);
        // Store recent activities (first 5)
        setRecentActivities(formattedEntries.slice(0, 5));
      } catch (error) {
        console.error('Error loading activities:', error);
      } finally {
        setIsLoadingActivities(false);
      }
    };

    loadActivities();
  }, [user?.uid]);

  const handleSave = () => {
    onUpdateProfile?.(formData);
    setIsEditing(false);
  };

  const handleViewAllActivities = () => {
    setShowAllActivities(!showAllActivities);
  };

  const handleCancel = () => {
    setFormData({
      displayName: user?.displayName || '',
      bio: user?.bio || '',
      location: user?.location || '',
      carbonGoal: user?.carbonGoal || '',
      weeklyTarget: user?.weeklyTarget || 20,
      monthlyTarget: user?.monthlyTarget || 80,
      preferences: {
        emailNotifications: user?.preferences?.emailNotifications ?? true,
        weeklyReports: user?.preferences?.weeklyReports ?? true,
        dailyTips: user?.preferences?.dailyTips ?? true,
      }
    });
    setIsEditing(false);
  };

  const stats = [
    { 
      label: 'Total CO₂ Saved', 
      value: `${user?.totalCO2Saved?.toFixed(1) || '0.0'} kg`, 
      color: 'text-green-600',
      icon: Leaf
    },
    { 
      label: 'Green Points', 
      value: user?.greenPoints || 0, 
      color: 'text-yellow-600',
      icon: Trophy
    },
    { 
      label: 'Activity Streak', 
      value: `${user?.activityStreak || 0} days`, 
      color: 'text-blue-600',
      icon: TrendingUp
    },
    { 
      label: 'Badges Earned', 
      value: user?.badgesEarned?.length || 0, 
      color: 'text-purple-600',
      icon: Target
    },
  ];

  const badgeColors = {
    'newcomer': 'bg-green-100 text-green-800',
    'google-user': 'bg-blue-100 text-blue-800',
    'eco-warrior': 'bg-emerald-100 text-emerald-800',
    'carbon-saver': 'bg-yellow-100 text-yellow-800',
    'streak-master': 'bg-orange-100 text-orange-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Your Eco Profile</h1>
        <p className="text-muted-foreground">Manage your profile and track your environmental journey</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Profile Information</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-1"
                >
                  {isEditing ? <X size={16} /> : <Edit2 size={16} />}
                  <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user?.photoURL} />
                  <AvatarFallback className="bg-green-100 text-green-600 text-2xl">
                    {user?.displayName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                {isEditing ? (
                  <div className="w-full space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={formData.displayName}
                        onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="e.g., San Francisco, CA"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="weeklyTarget">Weekly Target (kg CO₂)</Label>
                      <Input
                        id="weeklyTarget"
                        type="number"
                        value={formData.weeklyTarget}
                        onChange={(e) => setFormData({...formData, weeklyTarget: Number(e.target.value)})}
                        placeholder="e.g., 20"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="monthlyTarget">Monthly Target (kg CO₂)</Label>
                      <Input
                        id="monthlyTarget"
                        type="number"
                        value={formData.monthlyTarget}
                        onChange={(e) => setFormData({...formData, monthlyTarget: Number(e.target.value)})}
                        placeholder="e.g., 80"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        placeholder="Tell us about your eco journey..."
                        rows={3}
                      />
                    </div>
                    
                    {/* Preferences */}
                    <div className="space-y-3">
                      <Label>Notification Preferences</Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Bell size={16} />
                            <span className="text-sm">Email Notifications</span>
                          </div>
                          <Switch
                            checked={formData.preferences.emailNotifications}
                            onCheckedChange={(checked) => setFormData({
                              ...formData,
                              preferences: {...formData.preferences, emailNotifications: checked}
                            })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Mail size={16} />
                            <span className="text-sm">Weekly Reports</span>
                          </div>
                          <Switch
                            checked={formData.preferences.weeklyReports}
                            onCheckedChange={(checked) => setFormData({
                              ...formData,
                              preferences: {...formData.preferences, weeklyReports: checked}
                            })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Leaf size={16} />
                            <span className="text-sm">Daily Tips</span>
                          </div>
                          <Switch
                            checked={formData.preferences.dailyTips}
                            onCheckedChange={(checked) => setFormData({
                              ...formData,
                              preferences: {...formData.preferences, dailyTips: checked}
                            })}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Button onClick={handleSave} className="w-full bg-green-600 hover:bg-green-700">
                      <Save size={16} className="mr-2" />
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <div className="w-full space-y-3">
                    <h2 className="text-xl font-semibold text-center">
                      {user?.displayName || 'Eco Enthusiast'}
                    </h2>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar size={16} />
                        <span>Joined {new Date(user?.joinedDate || '2024-01-01').toLocaleDateString()}</span>
                      </div>
                      
                      {formData.location && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin size={16} />
                          <span>{formData.location}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Target size={16} />
                        <span>Weekly: {user?.weeklyTarget || 20}kg • Monthly: {user?.monthlyTarget || 80}kg</span>
                      </div>
                    </div>
                    
                    {formData.bio && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{formData.bio}</p>
                      </div>
                    )}
                    
                    {/* Badges */}
                    {user?.badgesEarned && user.badgesEarned.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Badges Earned</p>
                        <div className="flex flex-wrap gap-2">
                          {user.badgesEarned.map((badge, index) => (
                            <Badge key={index} className={badgeColors[badge as keyof typeof badgeColors] || 'bg-gray-100 text-gray-800'}>
                              {badge.replace('-', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Leaf className="text-green-600" size={20} />
                <span>Your Impact</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {showAllActivities ? `All Eco Activities (${allActivities.length})` : 'Recent Eco Activities'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingActivities ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : (showAllActivities ? allActivities : recentActivities).length > 0 ? (
                <div className="space-y-4">
                  {(showAllActivities ? allActivities : recentActivities).map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <h3 className="font-medium text-gray-900">{activity.action}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(activity.date).toLocaleDateString()} • {activity.category}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          {activity.impact}
                        </Badge>
                        <p className="text-sm text-yellow-600 font-medium">{activity.points}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>No activities yet. Start tracking your carbon footprint!</p>
                </div>
              )}
              
              {allActivities.length > 5 && (
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={handleViewAllActivities}
                >
                  {showAllActivities ? 'Show Recent Activities' : `View All Activities (${allActivities.length})`}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
