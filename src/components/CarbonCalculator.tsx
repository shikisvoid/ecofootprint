
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Car, Home, UtensilsCrossed, Trash2 } from 'lucide-react';

interface CarbonCalculatorProps {
  onAddEntry?: (entry: any) => void;
}

const CarbonCalculator = ({ onAddEntry }: CarbonCalculatorProps) => {
  const [category, setCategory] = useState('');
  const [activity, setActivity] = useState('');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const { toast } = useToast();

  const categories = {
    transport: {
      icon: Car,
      activities: {
        'car_petrol': { label: 'Car (Petrol)', factor: 0.21 },
        'car_diesel': { label: 'Car (Diesel)', factor: 0.17 },
        'bus': { label: 'Bus', factor: 0.08 },
        'train': { label: 'Train', factor: 0.04 },
        'flight_domestic': { label: 'Flight (Domestic)', factor: 0.25 },
        'flight_international': { label: 'Flight (International)', factor: 0.29 },
      }
    },
    energy: {
      icon: Home,
      activities: {
        'electricity': { label: 'Electricity (kWh)', factor: 0.41 },
        'natural_gas': { label: 'Natural Gas (m³)', factor: 2.03 },
        'heating_oil': { label: 'Heating Oil (L)', factor: 2.52 },
      }
    },
    food: {
      icon: UtensilsCrossed,
      activities: {
        'beef': { label: 'Beef (kg)', factor: 27.0 },
        'chicken': { label: 'Chicken (kg)', factor: 6.9 },
        'fish': { label: 'Fish (kg)', factor: 5.4 },
        'vegetables': { label: 'Vegetables (kg)', factor: 2.0 },
        'dairy': { label: 'Dairy (L)', factor: 3.2 },
      }
    },
    waste: {
      icon: Trash2,
      activities: {
        'general_waste': { label: 'General Waste (kg)', factor: 0.57 },
        'recycling': { label: 'Recycling (kg)', factor: 0.21 },
        'composting': { label: 'Composting (kg)', factor: 0.05 },
      }
    }
  };

  const calculateEmissions = () => {
    if (!category || !activity || !amount) return;

    const activityData = categories[category as keyof typeof categories]?.activities[activity as keyof any];
    if (!activityData) return;

    const emissions = parseFloat(amount) * activityData.factor;
    setResult(emissions);

    if (onAddEntry) {
      onAddEntry({
        category,
        activity: activityData.label,
        amount: parseFloat(amount),
        co2Emission: emissions,
        date: new Date().toISOString(),
      });

      toast({
        title: "Carbon entry added! 🌱",
        description: `Tracked ${emissions.toFixed(2)} kg CO₂ from ${activityData.label}`,
      });

      // Reset form after successful entry
      setCategory('');
      setActivity('');
      setAmount('');
      setResult(null);
    }
  };

  const CategoryIcon = category ? categories[category as keyof typeof categories]?.icon : Calculator;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="text-green-600" size={24} />
            <span>Carbon Footprint Calculator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transport">🚗 Transport</SelectItem>
                  <SelectItem value="energy">🏠 Energy</SelectItem>
                  <SelectItem value="food">🍽️ Food</SelectItem>
                  <SelectItem value="waste">🗑️ Waste</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {category && (
              <div className="space-y-2">
                <Label htmlFor="activity">Activity</Label>
                <Select value={activity} onValueChange={setActivity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categories[category as keyof typeof categories].activities).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {activity && (
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="focus:ring-green-500 focus:border-green-500"
              />
            </div>
          )}

          <Button 
            onClick={calculateEmissions}
            disabled={!category || !activity || !amount}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Calculate CO₂ Emissions
          </Button>
        </CardContent>
      </Card>

      {result !== null && (
        <Card className="border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CategoryIcon className="text-green-600 mr-2" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-green-800">
                {result.toFixed(2)} kg CO₂
              </h3>
              <p className="text-green-600 mt-2">
                Carbon emissions for this activity
              </p>
              <div className="mt-4 p-3 bg-card rounded-lg border">
                <p className="text-sm text-muted-foreground">
                  💡 Tip: Consider eco-friendly alternatives to reduce your carbon footprint!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CarbonCalculator;
