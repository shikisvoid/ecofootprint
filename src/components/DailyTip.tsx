
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, RefreshCw, BookOpen, Leaf } from 'lucide-react';

const DailyTip = () => {
  const [currentTip, setCurrentTip] = useState(0);

  const tips = [
    {
      id: 1,
      title: "Switch to LED Lighting",
      content: "Replace traditional incandescent bulbs with LED lights to reduce energy consumption by up to 80% and lower your electricity bills significantly.",
      category: "Energy",
      impact: "high",
      co2Savings: "15-20 kg CO₂/year per bulb",
      difficulty: "Easy",
      timeToImplement: "5 minutes"
    },
    {
      id: 2,
      title: "Start Composting",
      content: "Turn your kitchen scraps into nutrient-rich compost for your garden. This reduces methane emissions from landfills and creates valuable soil amendment.",
      category: "Waste",
      impact: "medium",
      co2Savings: "300-500 kg CO₂/year",
      difficulty: "Medium",
      timeToImplement: "30 minutes setup"
    },
    {
      id: 3,
      title: "Take Public Transport",
      content: "Use public transportation, carpool, or bike instead of driving alone. Even replacing one car trip per week can make a significant environmental impact.",
      category: "Transport",
      impact: "high",
      co2Savings: "1,000+ kg CO₂/year",
      difficulty: "Easy",
      timeToImplement: "Immediate"
    },
    {
      id: 4,
      title: "Reduce Meat Consumption",
      content: "Try 'Meatless Monday' or incorporate more plant-based meals into your diet. Livestock farming contributes significantly to greenhouse gas emissions.",
      category: "Food",
      impact: "high",
      co2Savings: "500-800 kg CO₂/year",
      difficulty: "Medium",
      timeToImplement: "Immediate"
    },
    {
      id: 5,
      title: "Unplug Electronics",
      content: "Unplug chargers and electronics when not in use. Many devices draw power even when turned off, contributing to 'phantom' energy consumption.",
      category: "Energy",
      impact: "low",
      co2Savings: "50-100 kg CO₂/year",
      difficulty: "Easy",
      timeToImplement: "Immediate"
    },
    {
      id: 6,
      title: "Use a Reusable Water Bottle",
      content: "Ditch single-use plastic bottles and invest in a quality reusable water bottle. This simple change can prevent hundreds of plastic bottles from entering landfills.",
      category: "Waste",
      impact: "medium",
      co2Savings: "20-30 kg CO₂/year",
      difficulty: "Easy",
      timeToImplement: "Immediate"
    }
  ];

  const getNextTip = () => {
    setCurrentTip((prev) => (prev + 1) % tips.length);
  };

  const getRandomTip = () => {
    const randomIndex = Math.floor(Math.random() * tips.length);
    setCurrentTip(randomIndex);
  };

  const currentTipData = tips[currentTip];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Energy': return '⚡';
      case 'Transport': return '🚗';
      case 'Food': return '🍽️';
      case 'Waste': return '♻️';
      default: return '🌱';
    }
  };

  // Auto-rotate tips every 30 seconds
  useEffect(() => {
    const interval = setInterval(getNextTip, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Daily Eco Tip 🌱</h1>
        <p className="text-muted-foreground">Discover simple ways to reduce your environmental impact</p>
      </div>

      {/* Main Tip Card */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="text-yellow-500" size={24} />
              <span>Tip #{currentTipData.id}</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Badge className={getCategoryIcon(currentTipData.category)}>
                {getCategoryIcon(currentTipData.category)} {currentTipData.category}
              </Badge>
              <Badge variant="outline" className={getImpactColor(currentTipData.impact)}>
                {currentTipData.impact.toUpperCase()} Impact
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {currentTipData.title}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {currentTipData.content}
            </p>
          </div>

          {/* Impact Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white bg-opacity-60 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-600">Potential CO₂ Savings</p>
              <p className="font-bold text-green-600">{currentTipData.co2Savings}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Difficulty</p>
              <p className="font-bold text-blue-600">{currentTipData.difficulty}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Time to Implement</p>
              <p className="font-bold text-purple-600">{currentTipData.timeToImplement}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={getRandomTip}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <RefreshCw size={16} className="mr-2" />
              Get New Tip
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => console.log('Mark as completed')}
            >
              <Leaf size={16} className="mr-2" />
              Mark as Done (+10 points)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tip Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="text-blue-500" size={20} />
            <span>Browse All Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {tips.map((tip, index) => (
              <Button
                key={tip.id}
                variant={index === currentTip ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentTip(index)}
                className={`p-2 h-auto flex flex-col items-center space-y-1 ${
                  index === currentTip 
                    ? 'bg-green-600 text-white' 
                    : 'hover:bg-green-50 hover:border-green-300'
                }`}
              >
                <span className="text-lg">{getCategoryIcon(tip.category)}</span>
                <span className="text-xs text-center leading-tight">
                  {tip.title.split(' ').slice(0, 2).join(' ')}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Categories Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Energy', 'Transport', 'Food', 'Waste'].map((category) => {
          const categoryTips = tips.filter(tip => tip.category === category);
          return (
            <Card key={category} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">{getCategoryIcon(category)}</div>
                <h3 className="font-semibold text-gray-900">{category}</h3>
                <p className="text-sm text-gray-600">{categoryTips.length} tips</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DailyTip;
