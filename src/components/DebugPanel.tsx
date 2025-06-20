import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { carbonService } from '@/services/carbonService';

interface DebugPanelProps {
  user: any;
  carbonEntries: any[];
}

const DebugPanel = ({ user, carbonEntries }: DebugPanelProps) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testFirebaseConnection = async () => {
    addLog('Testing Firebase connection...');
    try {
      const result = await carbonService.testConnection();
      addLog(`Firebase connection test: ${result ? 'SUCCESS' : 'FAILED'}`);
    } catch (error) {
      addLog(`Firebase connection error: ${error}`);
    }
  };

  const testDataFetch = async () => {
    if (!user?.uid) {
      addLog('No user ID available');
      return;
    }

    addLog(`Fetching data for user: ${user.uid}`);
    try {
      const entries = await carbonService.getUserCarbonEntries(user.uid);
      addLog(`Fetched ${entries.length} entries`);

      const stats = await carbonService.getDashboardStats(user.uid);
      addLog(`Dashboard stats: ${stats.totalEntries} entries, ${stats.totalCO2Saved} kg CO2`);
    } catch (error) {
      addLog(`Data fetch error: ${error}`);
    }
  };

  const addTestEntry = async () => {
    if (!user?.uid) {
      addLog('No user ID available');
      return;
    }

    addLog('Adding test carbon entry...');
    try {
      const testEntry = {
        userId: user.uid,
        category: 'transport',
        activity: 'Car - Gasoline',
        amount: 10,
        co2Emission: 2.3,
        date: new Date().toISOString()
      };

      const entryId = await carbonService.addCarbonEntry(testEntry);
      addLog(`Test entry added with ID: ${entryId}`);
    } catch (error) {
      addLog(`Add entry error: ${error}`);
    }
  };

  useEffect(() => {
    addLog(`Component mounted. User: ${user?.uid || 'none'}, Entries: ${carbonEntries.length}`);
  }, [user, carbonEntries]);

  if (!isVisible) {
    return (
      <Button 
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
      >
        Debug
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-auto z-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex justify-between items-center">
          Debug Panel
          <Button onClick={() => setIsVisible(false)} variant="ghost" size="sm">×</Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <Button onClick={testFirebaseConnection} size="sm" variant="outline">
            Test Connection
          </Button>
          <Button onClick={testDataFetch} size="sm" variant="outline">
            Test Data
          </Button>
          <Button onClick={() => setLogs([])} size="sm" variant="outline">
            Clear
          </Button>
        </div>
        
        <div className="text-xs space-y-1 max-h-48 overflow-auto bg-gray-50 p-2 rounded">
          {logs.length === 0 ? (
            <div className="text-gray-500">No logs yet...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="font-mono">{log}</div>
            ))
          )}
        </div>
        
        <div className="text-xs text-gray-600">
          <div>User ID: {user?.uid || 'Not logged in'}</div>
          <div>Carbon Entries: {carbonEntries.length}</div>
          <div>User Points: {user?.greenPoints || 0}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugPanel;
