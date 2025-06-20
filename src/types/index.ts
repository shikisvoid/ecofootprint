
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  greenPoints: number;
  totalCO2Saved: number;
  joinedDate: string;
}

export interface CarbonEntry {
  id: string;
  userId: string;
  category: 'transport' | 'energy' | 'food' | 'waste';
  activity: string;
  amount: number;
  co2Emission: number;
  date: string;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  earned: boolean;
  earnedDate?: string;
}

export interface DailyTip {
  id: string;
  title: string;
  content: string;
  category: string;
  impact: 'low' | 'medium' | 'high';
}

export interface EcoSuggestion {
  id: string;
  query: string;
  response: string;
  category: string;
  timestamp: string;
}
