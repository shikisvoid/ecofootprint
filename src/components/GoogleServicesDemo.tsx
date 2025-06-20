import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { 
  BarChart3, 
  Globe, 
  Cloud, 
  Calendar, 
  Download,
  Bell,
  Languages,
  TrendingUp
} from 'lucide-react';

// Import our Google services
import { analyticsService } from '../services/analyticsService';
import { translationService } from '../services/translationService';
import { googleDriveService } from '../services/googleDriveService';
import { googleCalendarService } from '../services/googleCalendarService';

const GoogleServicesDemo: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Demo: Google Analytics tracking
  const handleTrackEvent = (eventType: string) => {
    switch (eventType) {
      case 'carbon':
        analyticsService.trackCarbonCalculation('transport', 25.5, 'kg CO2');
        toast.success('🔥 Carbon calculation tracked!');
        break;
      case 'suggestion':
        analyticsService.trackEcoSuggestion('reduce energy usage', 'energy', 'high');
        toast.success('💡 Eco suggestion tracked!');
        break;
      case 'achievement':
        analyticsService.trackAchievement('First Week Complete', 100);
        toast.success('🏆 Achievement tracked!');
        break;
      case 'report':
        analyticsService.trackReportGeneration('monthly', '30-days');
        toast.success('📊 Report generation tracked!');
        break;
    }
  };

  // Demo: Google Translate
  const handleTranslate = async () => {
    if (selectedLanguage === 'en') {
      toast.info('Select a different language to see translation');
      return;
    }

    setIsLoading(true);
    try {
      const sampleText = 'Reduce your carbon footprint by using public transportation, eating plant-based meals, and conserving energy at home.';
      const translated = await translationService.translateText(sampleText, selectedLanguage);
      setTranslatedText(translated);
      toast.success(`🌍 Text translated to ${translationService.getSupportedLanguages()[selectedLanguage]}!`);
    } catch (error) {
      toast.error('Translation failed. Please check your API key.');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo: Google Drive backup
  const handleDriveBackup = async () => {
    setIsLoading(true);
    try {
      // Mock report data
      const mockReportData = {
        userId: 'demo-user',
        userEmail: 'demo@example.com',
        period: 'monthly',
        totalEmissions: 245.7,
        categories: {
          transport: 120.3,
          energy: 85.2,
          food: 40.2
        },
        topCategory: 'transport',
        improvement: -15.3,
        entries: [
          { date: '2024-01-15', category: 'transport', amount: 12.5, description: 'Car commute' },
          { date: '2024-01-16', category: 'energy', amount: 8.3, description: 'Home electricity' }
        ],
        achievements: ['First Week', 'Energy Saver'],
        suggestions: ['Use public transport', 'Switch to LED bulbs']
      };

      const fileId = await googleDriveService.saveReportToDrive(mockReportData, 'Demo_Carbon_Report');
      
      if (fileId) {
        toast.success('☁️ Report saved to Google Drive!');
      } else {
        toast.error('Drive backup failed. Please authenticate first.');
      }
    } catch (error) {
      toast.error('Drive backup failed. Please check your API key.');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo: Google Calendar reminder
  const handleCreateReminder = async () => {
    setIsLoading(true);
    try {
      const eventId = await googleCalendarService.createEcoReminder({
        title: 'Track Your Carbon Footprint',
        description: 'Time to log your daily eco-friendly activities! 🌱',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        duration: 15,
        category: 'general'
      });

      if (eventId) {
        toast.success('📅 Eco reminder created in your calendar!');
      } else {
        toast.error('Calendar reminder failed. Please authenticate first.');
      }
    } catch (error) {
      toast.error('Calendar reminder failed. Please check your API key.');
    } finally {
      setIsLoading(false);
    }
  };

  const supportedLanguages = translationService.getSupportedLanguages();

  return (
    <div className="space-y-6 p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-green-600 mb-2">🌟 Google Services Integration</h2>
        <p className="text-gray-600">Explore the enhanced capabilities of your EcoCloudApp</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Google Analytics Demo */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Google Analytics 4
            </CardTitle>
            <CardDescription>
              Track user behavior and app performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleTrackEvent('carbon')}
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Track Carbon
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleTrackEvent('suggestion')}
              >
                💡 Track Suggestion
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleTrackEvent('achievement')}
              >
                🏆 Track Achievement
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleTrackEvent('report')}
              >
                📊 Track Report
              </Button>
            </div>
            <Badge variant="secondary" className="w-full justify-center">
              ✅ Events tracked in Google Analytics
            </Badge>
          </CardContent>
        </Card>

        {/* Google Translate Demo */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-600" />
              Google Translate
            </CardTitle>
            <CardDescription>
              Make your app globally accessible
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(supportedLanguages).map(([code, name]) => (
                  <SelectItem key={code} value={code}>
                    <Languages className="h-4 w-4 mr-2 inline" />
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleTranslate} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Translating...' : 'Translate Sample Text'}
            </Button>
            
            {translatedText && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">{translatedText}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Google Drive Demo */}
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-orange-600" />
              Google Drive Backup
            </CardTitle>
            <CardDescription>
              Save carbon reports to the cloud
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleDriveBackup} 
              disabled={isLoading}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Backup Report to Drive'}
            </Button>
            
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Creates "EcoCloudApp Reports" folder</p>
              <p>• Saves detailed carbon footprint data</p>
              <p>• Includes achievements and suggestions</p>
            </div>
            
            <Badge variant="outline" className="w-full justify-center">
              📁 Organized cloud storage
            </Badge>
          </CardContent>
        </Card>

        {/* Google Calendar Demo */}
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Google Calendar
            </CardTitle>
            <CardDescription>
              Create eco-friendly reminders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleCreateReminder} 
              disabled={isLoading}
              className="w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              {isLoading ? 'Creating...' : 'Create Eco Reminder'}
            </Button>
            
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Daily carbon tracking reminders</p>
              <p>• Eco-challenge events</p>
              <p>• Sustainable habit notifications</p>
            </div>
            
            <Badge variant="outline" className="w-full justify-center">
              🔔 Smart habit building
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Setup Instructions */}
      <Card className="border-gray-200 bg-gray-50">
        <CardHeader>
          <CardTitle className="text-center">🔧 Setup Required</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>To enable these features:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Get API keys from Google Cloud Console</li>
              <li>Update your .env file with the keys</li>
              <li>Rebuild and deploy your application</li>
              <li>See GOOGLE_SERVICES_SETUP.md for detailed instructions</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleServicesDemo;
