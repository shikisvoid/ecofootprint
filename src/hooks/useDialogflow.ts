// Custom hook for Dialogflow integration in EcoCloudApp
// Provides easy access to conversational AI functionality

import { useState, useEffect, useCallback } from 'react';
import { dialogflowService, type ChatMessage, type ConversationSession } from '@/services/dialogflowService';
import { webhookService } from '@/services/webhookService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UseDialogflowOptions {
  autoStart?: boolean;
  enableWebhook?: boolean;
  sessionTimeout?: number; // in minutes
}

export interface UseDialogflowReturn {
  // State
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  sessionId: string | null;
  isConnected: boolean;
  
  // Actions
  sendMessage: (message: string) => Promise<ChatMessage | null>;
  clearConversation: () => void;
  startNewSession: () => string;
  getConversationHistory: () => ChatMessage[];
  
  // Session management
  getUserSessions: () => ConversationSession[];
  switchToSession: (sessionId: string) => void;
}

export const useDialogflow = (options: UseDialogflowOptions = {}): UseDialogflowReturn => {
  const {
    autoStart = true,
    enableWebhook = true,
    sessionTimeout = 30 // 30 minutes default
  } = options;
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize session when user is available
  useEffect(() => {
    if (user && autoStart && !sessionId) {
      startNewSession();
    }
  }, [user, autoStart, sessionId]);

  // Session timeout cleanup
  useEffect(() => {
    if (!sessionId || !sessionTimeout) return;

    const timeoutId = setTimeout(() => {
      console.log('🕐 Session timeout reached, clearing session');
      clearConversation();
      toast({
        title: "Session Expired",
        description: "Your conversation session has expired. Starting a new session.",
      });
    }, sessionTimeout * 60 * 1000);

    return () => clearTimeout(timeoutId);
  }, [sessionId, sessionTimeout]);

  // Start a new conversation session
  const startNewSession = useCallback((): string => {
    if (!user) {
      console.warn('Cannot start session: user not authenticated');
      return '';
    }

    const newSessionId = dialogflowService.createSession(user.uid);
    setSessionId(newSessionId);
    setIsConnected(true);
    
    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome-' + Date.now(),
      text: "Hello! I'm your EcoCloudApp assistant. I can help you track your carbon footprint, get environmental insights, and provide personalized recommendations. How can I assist you today? 🌱",
      sender: 'bot',
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    
    console.log('🚀 Started new Dialogflow session:', newSessionId);
    return newSessionId;
  }, [user]);

  // Send message to Dialogflow
  const sendMessage = useCallback(async (message: string): Promise<ChatMessage | null> => {
    if (!user || !sessionId || !message.trim()) {
      console.warn('Cannot send message: missing user, session, or empty message');
      return null;
    }

    setIsLoading(true);
    setIsTyping(true);

    try {
      // Add user message immediately
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        text: message.trim(),
        sender: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);

      // Get response from Dialogflow service
      const botResponse = await dialogflowService.sendMessage(sessionId, message.trim(), user.uid);
      
      // If webhook is enabled and action requires fulfillment
      if (enableWebhook && botResponse.action && botResponse.action !== 'input.unknown') {
        try {
          // Simulate typing delay for better UX
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const webhookRequest = {
            queryResult: {
              queryText: message.trim(),
              action: botResponse.action,
              parameters: botResponse.parameters || {},
              intent: {
                displayName: botResponse.action
              }
            },
            session: sessionId
          };
          
          const webhookResponse = await webhookService.handleWebhook(webhookRequest, user.uid);
          
          // Update bot response with webhook fulfillment
          const enhancedResponse: ChatMessage = {
            ...botResponse,
            text: webhookResponse.fulfillmentText,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, enhancedResponse]);
          setIsTyping(false);
          
          return enhancedResponse;
        } catch (webhookError) {
          console.error('Webhook error:', webhookError);
          setIsTyping(false);
          
          // Fall back to original response
          setMessages(prev => [...prev, botResponse]);
          return botResponse;
        }
      } else {
        // No webhook needed, use direct response
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
        return botResponse;
      }
    } catch (error) {
      console.error('Error sending message to Dialogflow:', error);
      setIsTyping(false);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        text: "I'm sorry, I'm having trouble processing your request right now. Please try again later. 🤖",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, sessionId, enableWebhook, toast]);

  // Clear conversation and start fresh
  const clearConversation = useCallback(() => {
    if (sessionId) {
      dialogflowService.clearSession(sessionId);
    }
    
    setMessages([]);
    setSessionId(null);
    setIsConnected(false);
    setIsLoading(false);
    setIsTyping(false);
    
    console.log('🗑️ Cleared conversation');
  }, [sessionId]);

  // Get conversation history
  const getConversationHistory = useCallback((): ChatMessage[] => {
    if (!sessionId) return [];
    return dialogflowService.getConversationHistory(sessionId);
  }, [sessionId]);

  // Get all user sessions
  const getUserSessions = useCallback((): ConversationSession[] => {
    if (!user) return [];
    return dialogflowService.getUserSessions(user.uid);
  }, [user]);

  // Switch to existing session
  const switchToSession = useCallback((targetSessionId: string) => {
    const sessions = getUserSessions();
    const targetSession = sessions.find(s => s.sessionId === targetSessionId);
    
    if (targetSession) {
      setSessionId(targetSessionId);
      setMessages(targetSession.messages);
      setIsConnected(true);
      console.log('🔄 Switched to session:', targetSessionId);
    } else {
      console.warn('Session not found:', targetSessionId);
    }
  }, [getUserSessions]);

  return {
    // State
    messages,
    isLoading,
    isTyping,
    sessionId,
    isConnected,
    
    // Actions
    sendMessage,
    clearConversation,
    startNewSession,
    getConversationHistory,
    
    // Session management
    getUserSessions,
    switchToSession
  };
};
