
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  FileText, Download, Calendar as CalendarIcon, TrendingDown, BarChart3, PieChart,
  RefreshCw, MapPin, Thermometer, Wind, Eye, Zap, Globe, Leaf, AlertTriangle,
  Clock, Activity, TrendingUp, Radio, Trash2, ExternalLink
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';
import { environmentalDataService } from '@/services/environmentalDataService';
import {
  environmentalReportsService,
  EnvironmentalReport,
  RealtimeEnvironmentalData
} from '@/services/environmentalReportsService';
import { pdfGenerationService } from '@/services/pdfGenerationService';

interface ReportsProps {
  user?: any;
  carbonEntries?: any[];
}

const Reports = ({ user, carbonEntries = [] }: ReportsProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<EnvironmentalReport['type']>('monthly');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  // Real-time data state
  const [reports, setReports] = useState<EnvironmentalReport[]>([]);
  const [realtimeData, setRealtimeData] = useState<RealtimeEnvironmentalData | null>(null);
  const [weatherForecast, setWeatherForecast] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Load reports and real-time data on component mount
  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    console.log('Loading environmental reports for user:', user.uid);

    // Subscribe to real-time reports updates
    const unsubscribeReports = environmentalReportsService.subscribeToUserReports(
      user.uid,
      (updatedReports) => {
        console.log('Reports updated:', updatedReports.length);
        setReports(updatedReports);
        setIsLoading(false);
      }
    );

    // Subscribe to real-time environmental data
    const unsubscribeRealtimeData = environmentalReportsService.subscribeToRealtimeData(
      user.uid,
      (data) => {
        console.log('Realtime data updated:', data);
        setRealtimeData(data);
        setLastUpdated(new Date());
      }
    );

    // Store initial real-time data
    environmentalReportsService.storeRealtimeData(user.uid, carbonEntries)
      .then(() => console.log('Initial realtime data stored'))
      .catch(error => console.error('Error storing initial realtime data:', error));

    return () => {
      unsubscribeReports();
      unsubscribeRealtimeData();
    };
  }, [user?.uid, carbonEntries.length]);

  // Auto-refresh real-time data every 5 minutes
  useEffect(() => {
    if (!user?.uid) return;

    const interval = setInterval(() => {
      environmentalReportsService.storeRealtimeData(user.uid, carbonEntries)
        .then(() => {
          console.log('Real-time data refreshed');
          setLastUpdated(new Date());
        })
        .catch(error => console.error('Error refreshing realtime data:', error));
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user?.uid, carbonEntries]);

  // Test weather API
  const testWeatherAPI = async () => {
    try {
      console.log('🧪 Testing Weather API...');
      setIsLoading(true);

      const weatherData = await environmentalDataService.getWeatherData();
      console.log('✅ Weather API Test Result:', weatherData);

      toast({
        title: "🌤️ Weather API Test Successful!",
        description: `${weatherData.location}: ${weatherData.temperature}°C, ${weatherData.condition}. Humidity: ${weatherData.humidity}%, Wind: ${weatherData.windSpeed} m/s, UV Index: ${weatherData.uvIndex}`
      });

      // Also test forecast
      const forecast = await environmentalDataService.getWeatherForecast();
      if (forecast) {
        console.log('📅 Weather forecast test successful:', forecast);
        setWeatherForecast(forecast);
        toast({
          title: "📊 Weather Forecast Available",
          description: `5-day forecast loaded with ${forecast.list?.length || 0} data points`
        });
      }

    } catch (error) {
      console.error('❌ Weather API test failed:', error);
      toast({
        title: "❌ Weather API Test Failed",
        description: `Error: ${(error as Error).message}. Check console for details.`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh real-time data manually
  const refreshRealtimeData = async () => {
    if (!user?.uid) {
      toast({
        title: "Error",
        description: "Please log in to refresh data",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🔄 Manually refreshing real-time data...');
      setIsLoading(true);

      await environmentalReportsService.storeRealtimeData(user.uid, carbonEntries);
      setLastUpdated(new Date());

      toast({
        title: realtimeData ? "🔄 Data Refreshed!" : "📊 Data Loaded!",
        description: realtimeData
          ? "Real-time environmental data has been updated"
          : "Real-time environmental data has been loaded successfully"
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate new report
  const handleGenerateReport = async () => {
    if (!user?.uid) {
      toast({
        title: "Error",
        description: "Please log in to generate reports",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      console.log(`Generating ${selectedPeriod} report...`);
      const reportId = await environmentalReportsService.generateReport(
        user.uid,
        selectedPeriod,
        carbonEntries
      );

      toast({
        title: "Report Generated! 📊",
        description: `Your ${selectedPeriod} environmental report has been created successfully.`
      });

      console.log('Report generated with ID:', reportId);
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Download report as PDF
  const handleDownload = async (reportId: string) => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) {
        toast({
          title: "Error",
          description: "Report not found.",
          variant: "destructive"
        });
        return;
      }

      console.log('📄 Generating PDF for report:', report.title);
      console.log('📄 Report data:', report);

      // Validate report has required data
      if (!report.title || typeof report.totalEmissions === 'undefined') {
        toast({
          title: "Error",
          description: "Report data is incomplete. Please regenerate the report.",
          variant: "destructive"
        });
        return;
      }

      // Generate PDF using the PDF service
      pdfGenerationService.generateReportPDF(report);

      toast({
        title: "📄 PDF Generated!",
        description: "Your environmental report has been downloaded as a PDF.",
        duration: 3000
      });
    } catch (error) {
      console.error('❌ Error generating PDF report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "PDF Generation Failed",
        description: `Error: ${errorMessage}. Please try again.`,
        variant: "destructive",
        duration: 5000
      });
    }
  };

  // Delete report
  const handleDeleteReport = async (reportId: string) => {
    try {
      await environmentalReportsService.deleteReport(reportId);
      toast({
        title: "Report Deleted",
        description: "The report has been removed successfully."
      });
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Error",
        description: "Failed to delete report.",
        variant: "destructive"
      });
    }
  };

  // Test PDF generation with sample data
  const testPDFGeneration = () => {
    try {
      const sampleReport = {
        id: 'test-report',
        userId: 'test-user',
        title: 'Sample Environmental Report',
        type: 'monthly' as const,
        period: 'Test Period',
        generatedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalEmissions: 45.6,
        reduction: 12.5,
        greenPoints: 150,
        status: 'completed' as const,
        emissionsByCategory: {
          transport: 15.2,
          energy: 12.8,
          food: 8.5,
          waste: 4.2,
          water: 3.1,
          shopping: 1.8
        },
        insights: [
          'Your transport emissions are higher than average',
          'Great job reducing energy consumption this month',
          'Consider switching to renewable energy sources'
        ],
        recommendations: [
          'Use public transport more frequently',
          'Install LED lighting in your home',
          'Reduce meat consumption by 2 days per week'
        ],
        achievements: [
          'Reduced carbon footprint by 12% this month',
          'Earned Green Warrior badge'
        ],
        airQuality: {
          aqi: 85,
          status: 'Moderate',
          location: 'Test City'
        },
        weather: {
          temperature: 22,
          condition: 'Sunny',
          humidity: 65,
          location: 'Test City'
        },
        carbonIntensity: {
          intensity: 450,
          region: 'Test Region'
        }
      };

      console.log('🧪 Testing PDF generation with sample data');
      pdfGenerationService.generateReportPDF(sampleReport);

      toast({
        title: "🧪 Test PDF Generated!",
        description: "Sample PDF report has been generated successfully.",
        duration: 3000
      });
    } catch (error) {
      console.error('❌ Test PDF generation failed:', error);
      toast({
        title: "Test Failed",
        description: `PDF test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  // Mock chart data
  const monthlyTrendData = [
    { month: 'Aug', emissions: 62, target: 50 },
    { month: 'Sep', emissions: 58, target: 50 },
    { month: 'Oct', emissions: 54, target: 50 },
    { month: 'Nov', emissions: 49, target: 50 },
    { month: 'Dec', emissions: 46, target: 50 },
    { month: 'Jan', emissions: 42, target: 50 },
  ];

  const categoryBreakdown = [
    { category: 'Transport', jan: 18, dec: 22, change: -18 },
    { category: 'Energy', jan: 15, dec: 17, change: -12 },
    { category: 'Food', jan: 8, dec: 6, change: 33 },
    { category: 'Waste', jan: 3, dec: 4, change: -25 },
  ];



  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Environmental Reports</h1>
            <p className="text-muted-foreground">Track your progress and download detailed PDF impact reports</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating || !user?.uid}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isGenerating ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Generating...
                </div>
              ) : (
                <>
                  <FileText size={16} className="mr-2" />
                  Generate Report
                </>
              )}
            </Button>
            <Badge variant="outline" className="bg-green-100 text-green-700">
              <Activity size={12} className="mr-1" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Report Generation */}
      <Card className="bg-gradient-to-r from-gray-900 to-green-900 border-green-600">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="text-green-400" size={24} />
            <span className="text-white">Generate New Report</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-green-300">Report Type</label>
              <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as EnvironmentalReport['type'])}>
                <SelectTrigger className="bg-gray-800 border-green-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-green-600">
                  <SelectItem value="weekly" className="text-white hover:bg-green-700">Weekly Report</SelectItem>
                  <SelectItem value="monthly" className="text-white hover:bg-green-700">Monthly Report</SelectItem>
                  <SelectItem value="quarterly" className="text-white hover:bg-green-700">Quarterly Report</SelectItem>
                  <SelectItem value="yearly" className="text-white hover:bg-green-700">Yearly Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-green-300">Period End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-gray-800 border-green-600 text-white hover:bg-gray-700">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-green-600" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className="p-3 pointer-events-auto text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleGenerateReport}
                disabled={isGenerating || !user?.uid}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isGenerating ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Generating...
                  </div>
                ) : (
                  <>
                    <FileText size={16} className="mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Environmental Data */}
      <Card className="bg-gradient-to-r from-gray-900 to-green-900 border-green-600">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Radio className="text-green-400" size={20} />
              <span className="text-white">Real-time Environmental Data</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={refreshRealtimeData}
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="text-green-400 border-green-600 hover:bg-green-800 bg-gray-800"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin mr-1"></div>
                ) : (
                  <RefreshCw size={14} className="mr-1" />
                )}
                {isLoading ? 'Loading...' : (realtimeData ? 'Refresh' : 'Load Data')}
              </Button>
              {realtimeData && (
                <Badge variant="outline" className="bg-green-800 text-green-300 border-green-600">
                  <Activity size={12} className="mr-1" />
                  Live
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {realtimeData ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-card rounded-lg border">
                <Wind className="mx-auto mb-2 text-blue-600" size={24} />
                <p className="text-sm text-muted-foreground">Air Quality</p>
                <p className="text-lg font-bold text-foreground">{realtimeData.airQuality.aqi}</p>
                <p className="text-xs text-muted-foreground">{realtimeData.airQuality.status}</p>
              </div>
              <div className="text-center p-4 bg-card rounded-lg border">
                <Thermometer className="mx-auto mb-2 text-orange-600" size={24} />
                <p className="text-sm text-muted-foreground">Temperature</p>
                <p className="text-lg font-bold text-foreground">{realtimeData.weather.temperature}°C</p>
                <p className="text-xs text-muted-foreground">{realtimeData.weather.condition}</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <Eye className="mx-auto mb-2 text-purple-600" size={24} />
                <p className="text-sm text-muted-foreground">Humidity</p>
                <p className="text-lg font-bold text-foreground">{realtimeData.weather.humidity}%</p>
                <p className="text-xs text-muted-foreground">Wind: {realtimeData.weather.windSpeed} m/s</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <Zap className="mx-auto mb-2 text-yellow-600" size={24} />
                <p className="text-sm text-muted-foreground">Carbon Intensity</p>
                <p className="text-lg font-bold text-foreground">{realtimeData.carbonIntensity.intensity}</p>
                <p className="text-xs text-muted-foreground">gCO₂/kWh</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <MapPin className="mx-auto mb-2 text-green-600" size={24} />
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="text-lg font-bold text-foreground">
                  {realtimeData.location?.city || `${realtimeData.location?.lat?.toFixed(2)}, ${realtimeData.location?.lon?.toFixed(2)}` || 'Unknown'}
                </p>
                <p className="text-xs text-muted-foreground">Updated: {new Date(realtimeData.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Radio className="mx-auto mb-4 text-green-400" size={48} />
              <h3 className="text-lg font-semibold text-white mb-2">No Real-time Data Available</h3>
              <p className="text-green-300 mb-4">Click "Load Data" to fetch current environmental conditions</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weather Forecast */}
      {weatherForecast && (
        <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="text-orange-600" size={20} />
              <span>5-Day Weather Forecast</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {weatherForecast.list?.slice(0, 5).map((item: any, index: number) => {
                const date = new Date(item.dt * 1000);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const temp = Math.round(item.main.temp);
                const condition = item.weather[0]?.main || 'Unknown';
                const icon = item.weather[0]?.icon;

                return (
                  <div key={index} className="text-center p-4 bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-700">
                    <p className="text-sm font-medium text-foreground">{dayName}</p>
                    <p className="text-xs text-muted-foreground">{date.toLocaleDateString()}</p>
                    {icon && (
                      <img
                        src={`https://openweathermap.org/img/w/${icon}.png`}
                        alt={condition}
                        className="mx-auto my-2 w-12 h-12"
                      />
                    )}
                    <p className="text-lg font-bold text-foreground">{temp}°C</p>
                    <p className="text-xs text-muted-foreground">{condition}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.main.humidity}% humidity
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month's Emissions</p>
                <p className="text-2xl font-bold text-foreground">
                  {realtimeData?.userCarbonFootprint.monthlyEmissions.toFixed(1) || '0.0'} kg CO₂
                </p>
                <p className="text-sm text-green-600">Real-time tracking</p>
              </div>
              <TrendingDown className="text-green-600" size={32} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reports Generated</p>
                <p className="text-2xl font-bold text-foreground">{reports.length}</p>
                <p className="text-sm text-blue-600">
                  {reports.filter(r => new Date(r.createdAt).getMonth() === new Date().getMonth()).length} this month
                </p>
              </div>
              <FileText className="text-blue-600" size={32} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weekly Emissions</p>
                <p className="text-2xl font-bold text-foreground">
                  {realtimeData?.userCarbonFootprint.weeklyEmissions.toFixed(1) || '0.0'} kg CO₂
                </p>
                <p className="text-sm text-purple-600">Last 7 days</p>
              </div>
              <Activity className="text-purple-600" size={32} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>6-Month Emissions Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="emissions" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#22c55e" 
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Comparison (Jan vs Dec)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="dec" fill="#94a3b8" name="December" />
                <Bar dataKey="jan" fill="#22c55e" name="January" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Report History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="text-blue-600" size={20} />
            <span>Report History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600">Loading reports...</span>
              </div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Yet</h3>
              <p className="text-gray-600 mb-4">Generate your first environmental report to get started!</p>
              <Button
                onClick={handleGenerateReport}
                disabled={isGenerating || !user?.uid}
                className="bg-green-600 hover:bg-green-700"
              >
                {isGenerating ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Generating...
                  </div>
                ) : (
                  <>
                    <FileText size={16} className="mr-2" />
                    Generate First Report
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-blue-800/30 transition-all duration-200 hover:shadow-md">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{report.title}</h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="outline">{report.type}</Badge>
                    <span className="text-sm text-muted-foreground">{report.period}</span>
                    <span className="text-sm text-muted-foreground">
                      Generated: {new Date(report.generatedDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-6 mt-2 text-sm">
                    <span className="text-red-600">
                      {report.totalEmissions} kg CO₂ total
                    </span>
                    <span className="text-green-600">
                      {report.reduction}% reduction
                    </span>
                    <span className="text-yellow-600">
                      {report.greenPoints} points earned
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(report.id!)}
                    className="flex items-center space-x-1"
                  >
                    <Download size={16} />
                    <span>Download PDF</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteReport(report.id!)}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
