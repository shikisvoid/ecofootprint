// ChatBot Component for EcoCloudApp Dialogflow Integration
// Provides conversational interface for carbon footprint tracking

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Minimize2,
  Maximize2,
  Trash2,
  Sparkles,
  HelpCircle,
  BookOpen,
  Settings,
  Lightbulb,
  Brain,
  Zap,
  Star,
  Shield,
  Mic,
  Copy,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { dialogflowService, type ChatMessage } from '@/services/dialogflowService';
import { webhookService } from '@/services/webhookService';
import { useAuth } from '@/contexts/AuthContext';

interface ChatBotProps {
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ 
  isMinimized = false, 
  onToggleMinimize 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [assistantStatus, setAssistantStatus] = useState<'online' | 'thinking' | 'typing'>('online');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize session when component mounts
  useEffect(() => {
    if (user) {
      const newSessionId = dialogflowService.createSession(user.uid);
      setSessionId(newSessionId);
      
      // Add sophisticated welcome message
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        text: "👋 **Welcome to EcoCloudApp AI Assistant**\n\nI'm your intelligent environmental companion, powered by advanced AI to help you achieve your sustainability goals.\n\n**🎯 What I can do for you:**\n\n🧮 **Smart Carbon Analysis** - Real-time footprint tracking\n🌍 **Environmental Intelligence** - Live air quality & weather data\n💡 **Personalized Recommendations** - AI-driven eco tips\n🧭 **Guided Navigation** - Expert app assistance\n📚 **Educational Insights** - Carbon facts & learning\n🔧 **Technical Support** - Instant troubleshooting\n🎯 **Goal Setting** - Smart environmental targets\n\n*Ready to make a positive impact? Let's get started!* ✨",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
    }
  }, [user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user || !sessionId || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    setIsThinking(true);
    setAssistantStatus('thinking');

    try {
      // Send message to Dialogflow service
      const response = await dialogflowService.sendMessage(sessionId, userMessage, user.uid);
      
      // If the response requires webhook fulfillment, process it
      if (response.action && response.action !== 'input.unknown') {
        setIsThinking(false);
        setIsTyping(true);
        setAssistantStatus('typing');

        // Simulate realistic AI processing delay
        setTimeout(async () => {
          try {
            const webhookRequest = {
              queryResult: {
                queryText: userMessage,
                action: response.action!,
                parameters: response.parameters || {},
                intent: {
                  displayName: response.action!
                }
              },
              session: sessionId
            };
            
            const webhookResponse = await webhookService.handleWebhook(webhookRequest, user.uid);
            
            // Update the bot message with webhook response
            const enhancedResponse: ChatMessage = {
              ...response,
              text: webhookResponse.fulfillmentText
            };
            
            setMessages(prev => {
              const updated = [...prev];
              // Replace the last bot message with enhanced response
              if (updated[updated.length - 1]?.sender === 'bot') {
                updated[updated.length - 1] = enhancedResponse;
              } else {
                updated.push(enhancedResponse);
              }
              return updated;
            });
            
            setIsTyping(false);
            setAssistantStatus('online');
          } catch (error) {
            console.error('Webhook error:', error);
            setIsTyping(false);
            setAssistantStatus('online');
          }
        }, 1500);
      } else {
        setIsThinking(false);
        setIsTyping(false);
        setAssistantStatus('online');
      }

      // Update messages with user message and initial bot response
      setMessages(prev => {
        const userMsg: ChatMessage = {
          id: `user-${Date.now()}`,
          text: userMessage,
          sender: 'user',
          timestamp: new Date()
        };
        
        return [...prev, userMsg, response];
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsThinking(false);
      setIsTyping(false);
      setAssistantStatus('online');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    if (sessionId) {
      dialogflowService.clearSession(sessionId);
      if (user) {
        const newSessionId = dialogflowService.createSession(user.uid);
        setSessionId(newSessionId);
      }
    }

    toast({
      title: "Chat cleared",
      description: "Conversation history has been cleared.",
    });
  };

  const sendQuickMessage = (message: string) => {
    setInputMessage(message);
    // Auto-send the message
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const getContextualQuickReplies = (): string[] => {
    if (messages.length === 0) return [];

    const lastBotMessage = messages.filter(m => m.sender === 'bot').pop();
    if (!lastBotMessage) return [];

    const lastAction = lastBotMessage.action;
    const lastText = lastBotMessage.text.toLowerCase();

    // Context-based quick replies
    if (lastAction === 'get.carbon.footprint' || lastText.includes('carbon footprint')) {
      return ['Generate my report', 'Give me reduction tips', 'Add new entry'];
    }

    if (lastAction === 'app.navigation.guide' || lastText.includes('guide') || lastText.includes('how to')) {
      return ['What else can I do?', 'Show other features', 'I need more help'];
    }

    if (lastAction === 'education.carbon.facts' || lastText.includes('fact')) {
      return ['Tell me another fact', 'How can I reduce this?', 'What about other categories?'];
    }

    if (lastAction === 'support.technical.help' || lastText.includes('troubleshoot')) {
      return ['Try another solution', 'Contact human support', 'It\'s working now'];
    }

    if (lastAction === 'app.feature.discovery' || lastText.includes('features')) {
      return ['How do I use reports?', 'Show me gamification', 'Take me to calculator'];
    }

    // Default helpful replies
    return ['Tell me a fact', 'How do I use the app?', 'What\'s my progress?'];
  };

  const formatMessageText = (text: string) => {
    // Convert newlines to line breaks and add basic formatting
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const getMessageIcon = (sender: 'user' | 'bot') => {
    return sender === 'bot' ? (
      <div className="relative">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
          <Brain className="h-4 w-4 text-white" />
        </div>
        {assistantStatus === 'thinking' && (
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-400 rounded-full animate-pulse">
            <Zap className="h-2 w-2 text-yellow-800 m-0.5" />
          </div>
        )}
        {assistantStatus === 'online' && (
          <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></div>
        )}
      </div>
    ) : (
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
        <User className="h-4 w-4 text-white" />
      </div>
    );
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggleMinimize}
          className="relative rounded-full h-14 w-14 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
        >
          <div className="relative">
            <Brain className="h-7 w-7" />
            <div className="absolute -top-2 -right-2 h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center">
              <Sparkles className="h-2 w-2 text-white" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[600px] z-50 shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
      <CardHeader className="pb-3 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-blue-500/10 border-b border-green-200/50 dark:border-green-700/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3 text-lg">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-2 w-2 text-white animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <span className="font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                EcoCloudApp AI
              </span>
              <div className="text-xs text-muted-foreground font-normal">
                {assistantStatus === 'thinking' && '🧠 Analyzing...'}
                {assistantStatus === 'typing' && '⌨️ Typing...'}
                {assistantStatus === 'online' && '🟢 Online & Ready'}
              </div>
            </div>
          </CardTitle>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
              title="Clear conversation"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMinimize}
              className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
              title="Minimize assistant"
            >
              <Minimize2 className="h-4 w-4 text-blue-500" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
            <Zap className="h-3 w-3 mr-1" />
            AI-Powered
          </Badge>
          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            <Shield className="h-3 w-3 mr-1" />
            Secure
          </Badge>
          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
            <Star className="h-3 w-3 mr-1" />
            Smart
          </Badge>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-1 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => sendQuickMessage("Show me around the app")}
            className="text-xs h-6 px-2"
          >
            <HelpCircle className="h-3 w-3 mr-1" />
            App Tour
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => sendQuickMessage("Tell me a carbon fact")}
            className="text-xs h-6 px-2"
          >
            <BookOpen className="h-3 w-3 mr-1" />
            Fun Facts
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => sendQuickMessage("What's my carbon footprint?")}
            className="text-xs h-6 px-2"
          >
            <Lightbulb className="h-3 w-3 mr-1" />
            My Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => sendQuickMessage("I need technical support")}
            className="text-xs h-6 px-2"
          >
            <Settings className="h-3 w-3 mr-1" />
            Support
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col h-[500px]">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-white/50 to-green-50/30 dark:from-gray-900/50 dark:to-green-900/10">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-2 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'bot' && (
                  <div className="flex-shrink-0 mt-1">
                    {getMessageIcon(message.sender)}
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 text-sm shadow-lg ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white ml-auto border border-blue-500/20'
                      : 'bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 text-gray-900 dark:text-gray-100 border border-green-200/50 dark:border-green-700/50'
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    {formatMessageText(message.text)}
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
                
                {message.sender === 'user' && (
                  <div className="flex-shrink-0 mt-1">
                    {getMessageIcon(message.sender)}
                  </div>
                )}
              </div>
            ))}
            
            {/* Advanced Thinking/Typing Indicators */}
            {isThinking && (
              <div className="flex items-start space-x-3">
                {getMessageIcon('bot')}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg px-4 py-3 border border-yellow-200 dark:border-yellow-700/50">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4 text-yellow-600 animate-pulse" />
                    <span className="text-sm text-yellow-700 dark:text-yellow-300">AI is analyzing your request...</span>
                  </div>
                  <div className="flex space-x-1 mt-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            {isTyping && !isThinking && (
              <div className="flex items-start space-x-3">
                {getMessageIcon('bot')}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg px-4 py-3 border border-green-200 dark:border-green-700/50">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-green-600 animate-pulse" />
                    <span className="text-sm text-green-700 dark:text-green-300">Crafting your response...</span>
                  </div>
                  <div className="flex space-x-1 mt-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Enhanced Input Area */}
        <div className="border-t border-green-200/50 dark:border-green-700/50 p-4 bg-gradient-to-r from-green-50/30 to-emerald-50/30 dark:from-green-900/10 dark:to-emerald-900/10">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your environmental impact..."
                disabled={isLoading}
                className="pr-10 border-green-200 dark:border-green-700 focus:border-green-400 dark:focus:border-green-500 bg-white/80 dark:bg-gray-800/80"
              />
              {inputMessage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInputMessage('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              size="sm"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          {/* Contextual Quick Replies */}
          {messages.length > 1 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {getContextualQuickReplies().map((reply, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => sendQuickMessage(reply)}
                  className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
                >
                  {reply}
                </Button>
              ))}
            </div>
          )}

          <div className="text-xs text-muted-foreground mt-3 text-center bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-2 border border-green-200/50 dark:border-green-700/50">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <Sparkles className="h-3 w-3 text-green-600" />
              <span className="font-medium text-green-700 dark:text-green-300">AI-Powered Assistant</span>
              <Sparkles className="h-3 w-3 text-green-600" />
            </div>
            <div className="text-green-600 dark:text-green-400">
              Try: "What's my carbon footprint?" • "Show me around the app" • "Tell me a fact"
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatBot;
