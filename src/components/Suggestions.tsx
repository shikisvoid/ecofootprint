
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Brain, Sparkles, CheckCircle, Zap } from 'lucide-react';
import { geminiService, EcoSuggestion } from '@/services/geminiService';

interface SuggestionsProps {
  user?: any;
  carbonEntries?: any[];
}

const Suggestions = ({ user, carbonEntries }: SuggestionsProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<EcoSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'testing' | 'connected' | 'failed'>('unknown');



  const handleSubmit = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('Getting AI suggestions for:', query);

      // Prepare user context for better personalized suggestions
      const userContext = {
        carbonEntries: carbonEntries || [],
        userProfile: user,
        location: user?.location || 'Unknown'
      };

      const aiSuggestion = await geminiService.getEcoSuggestions(query, userContext);

      setSuggestions([aiSuggestion, ...suggestions]);
      setQuery('');

      console.log('AI suggestion received:', aiSuggestion);
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      setError('Failed to get AI suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setConnectionStatus('testing');
    try {
      const isConnected = await geminiService.testConnection();
      setConnectionStatus(isConnected ? 'connected' : 'failed');
      if (!isConnected) {
        setError('Failed to connect to Gemini AI. Please check your API key configuration.');
      }
    } catch (error) {
      setConnectionStatus('failed');
      setError('Failed to test Gemini AI connection.');
    }
  };

  const clearSuggestions = () => {
    setSuggestions([]);
    setError(null);
  };

  const debugAPIKey = () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log('=== API KEY DEBUG ===');
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey?.length || 0);
    console.log('API Key first 10 chars:', apiKey?.substring(0, 10) || 'N/A');
    console.log('API Key last 10 chars:', apiKey?.substring(apiKey.length - 10) || 'N/A');
    console.log('Environment variables:', import.meta.env);
    alert(`API Key Debug:\nExists: ${!!apiKey}\nLength: ${apiKey?.length || 0}\nFirst 10: ${apiKey?.substring(0, 10) || 'N/A'}`);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const quickPrompts = [
    "How can I reduce my daily commute's carbon footprint?",
    "What are the most effective ways to make my home more energy efficient?",
    "How can I adopt a more sustainable diet without major lifestyle changes?",
    "What are practical ways to reduce plastic waste in my household?",
    "How can I make my shopping habits more environmentally friendly?",
    "What water conservation methods can I implement at home?",
    "How can I reduce food waste and its environmental impact?",
    "What are the best eco-friendly alternatives for common household products?"
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-foreground">Eco Suggestions</h1>
          <Badge variant="outline" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-300 dark:from-blue-900/20 dark:to-purple-900/20 dark:text-blue-300 dark:border-blue-700">
            <Brain size={14} className="mr-1" />
            AI-Powered
          </Badge>
        </div>
        <p className="text-muted-foreground">Get personalized environmental advice powered by Gemini AI based on your carbon tracking data</p>
        {user && (
          <p className="text-sm text-green-600">
            ✨ Personalized for {user.displayName || 'you'} • {carbonEntries?.length || 0} carbon entries analyzed
          </p>
        )}
      </div>

      {/* Query Input */}
      <Card className="bg-gradient-to-r from-gray-900 to-green-900 border-green-600">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="text-green-400" size={24} />
              <span className="text-white">Ask for Eco Advice</span>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300">
                <Brain size={12} className="mr-1" />
                AI-Powered
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Ask me anything about reducing your environmental impact... e.g., 'How can I make my daily commute more eco-friendly?'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
            className="bg-gray-800 border-green-600 text-white placeholder-green-300 focus:ring-green-500 focus:border-green-500"
          />

          <div className="flex justify-between items-center">
            <p className="text-sm text-green-300">
              💡 Be specific for more personalized suggestions
            </p>
            <Button
              onClick={handleSubmit}
              disabled={!query.trim() || isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Getting AI Suggestions...</span>
                </div>
              ) : (
                <>
                  <Brain size={16} className="mr-2" />
                  Get AI Suggestions
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Quick Prompts */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-green-300">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery(prompt)}
                  className="text-xs bg-gray-800 border-green-600 text-green-300 hover:bg-green-800 hover:border-green-500"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Welcome Message for New Users */}
      {suggestions.length === 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-700">
          <CardContent className="p-8 text-center">
            <Brain className="h-16 w-16 mx-auto mb-4 text-green-600 animate-pulse" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Welcome to AI-Powered Eco Suggestions! 🌱
            </h3>
            <p className="text-muted-foreground mb-4">
              Get personalized environmental advice powered by Gemini AI. Ask any question about reducing your carbon footprint,
              and I'll provide specific, actionable suggestions tailored to your lifestyle.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30">🧠 AI-Powered</Badge>
              <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">🎯 Personalized</Badge>
              <Badge variant="outline" className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30">📊 Data-Driven</Badge>
              <Badge variant="outline" className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30">🌍 Eco-Friendly</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI-Powered Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="text-green-600" size={20} />
                <span>AI-Powered Eco Suggestions</span>
                <Badge variant="outline" className="ml-2">Powered by Gemini AI</Badge>
              </div>
              <Button
                onClick={clearSuggestions}
                variant="outline"
                size="sm"
                className="text-gray-600 hover:text-red-600"
              >
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="border-l-4 border-green-500 pl-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-foreground text-lg">"{suggestion.query}"</h3>
                    <div className="flex space-x-2">
                      <Badge variant="outline">{suggestion.category}</Badge>
                      <Badge className={getImpactColor(suggestion.impact)}>
                        {suggestion.impact} impact
                      </Badge>
                      {suggestion.estimatedCO2Reduction && suggestion.estimatedCO2Reduction > 0 && (
                        <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-400">
                          <Zap size={12} className="mr-1" />
                          {suggestion.estimatedCO2Reduction}kg CO₂/year
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg mb-4 shadow-sm border border-gray-200 dark:border-gray-600">
                    <p className="text-foreground whitespace-pre-line leading-relaxed">{suggestion.response}</p>
                  </div>

                  {suggestion.actionItems && suggestion.actionItems.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg mb-3 border border-blue-200 dark:border-blue-700">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center">
                        <CheckCircle size={16} className="mr-2" />
                        Action Items
                      </h4>
                      <ul className="space-y-2">
                        {suggestion.actionItems.map((item, index) => (
                          <li key={index} className="flex items-start text-blue-800 dark:text-blue-300">
                            <span className="text-blue-500 mr-2 mt-1">•</span>
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{suggestion.timestamp}</span>
                    <span className="flex items-center">
                      <Brain size={12} className="mr-1" />
                      Generated by AI
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Previous AI Suggestions */}
      {suggestions.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="text-purple-600" size={20} />
              <span>Previous AI Suggestions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {suggestions.slice(1).map((suggestion) => (
                <div key={suggestion.id} className="border-l-4 border-purple-500 pl-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-foreground text-lg">"{suggestion.query}"</h3>
                    <div className="flex space-x-2">
                      <Badge variant="outline">{suggestion.category}</Badge>
                      <Badge className={getImpactColor(suggestion.impact)}>
                        {suggestion.impact} impact
                      </Badge>
                      {suggestion.estimatedCO2Reduction && suggestion.estimatedCO2Reduction > 0 && (
                        <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-400">
                          <Zap size={12} className="mr-1" />
                          {suggestion.estimatedCO2Reduction}kg CO₂/year
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg mb-4 shadow-sm border border-gray-200 dark:border-gray-600">
                    <p className="text-foreground whitespace-pre-line leading-relaxed">{suggestion.response}</p>
                  </div>

                  {suggestion.actionItems && suggestion.actionItems.length > 0 && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg mb-3 border border-purple-200 dark:border-purple-700">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2 flex items-center">
                        <CheckCircle size={16} className="mr-2" />
                        Action Items
                      </h4>
                      <ul className="space-y-2">
                        {suggestion.actionItems.map((item, index) => (
                          <li key={index} className="flex items-start text-purple-800 dark:text-purple-300">
                            <span className="text-purple-500 mr-2 mt-1">•</span>
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{suggestion.timestamp}</span>
                    <span className="flex items-center">
                      <Brain size={12} className="mr-1" />
                      Generated by AI
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Suggestions;
