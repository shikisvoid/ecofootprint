// Dialogflow Webhook Server for EcoCloudApp
// This handles webhook requests from Dialogflow ES

import { webhookService } from './webhookService';

export interface DialogflowWebhookRequest {
  responseId: string;
  queryResult: {
    queryText: string;
    action: string;
    parameters: Record<string, any>;
    allRequiredParamsPresent: boolean;
    fulfillmentText: string;
    fulfillmentMessages: any[];
    outputContexts: any[];
    intent: {
      name: string;
      displayName: string;
    };
    intentDetectionConfidence: number;
    languageCode: string;
  };
  originalDetectIntentRequest: {
    source: string;
    payload: any;
  };
  session: string;
}

export interface DialogflowWebhookResponse {
  fulfillmentText?: string;
  fulfillmentMessages?: Array<{
    text?: {
      text: string[];
    };
    card?: {
      title: string;
      subtitle: string;
      imageUri?: string;
      buttons?: Array<{
        text: string;
        postback: string;
      }>;
    };
    quickReplies?: {
      title: string;
      quickReplies: string[];
    };
  }>;
  outputContexts?: Array<{
    name: string;
    lifespanCount: number;
    parameters: Record<string, any>;
  }>;
  followupEventInput?: {
    name: string;
    parameters: Record<string, any>;
    languageCode: string;
  };
}

class DialogflowWebhookServer {
  // Main webhook handler for Dialogflow requests
  async handleWebhookRequest(
    request: DialogflowWebhookRequest,
    userId?: string
  ): Promise<DialogflowWebhookResponse> {
    try {
      console.log('🎯 Dialogflow webhook request received:', {
        action: request.queryResult.action,
        intent: request.queryResult.intent.displayName,
        queryText: request.queryResult.queryText,
        userId
      });

      // Extract user ID from session or parameters if not provided
      if (!userId) {
        userId = this.extractUserIdFromSession(request.session) || 'anonymous';
      }

      // Convert Dialogflow request to our webhook format
      const webhookRequest = {
        queryResult: {
          queryText: request.queryResult.queryText,
          action: request.queryResult.action,
          parameters: request.queryResult.parameters,
          intent: {
            displayName: request.queryResult.intent.displayName
          }
        },
        session: request.session,
        originalDetectIntentRequest: request.originalDetectIntentRequest
      };

      // Process with our webhook service
      const response = await webhookService.handleWebhook(webhookRequest, userId);

      // Convert our response to Dialogflow format
      const dialogflowResponse: DialogflowWebhookResponse = {
        fulfillmentText: response.fulfillmentText
      };

      // Add rich responses if available
      if (response.fulfillmentMessages) {
        dialogflowResponse.fulfillmentMessages = response.fulfillmentMessages;
      }

      // Add output contexts if available
      if (response.outputContexts) {
        dialogflowResponse.outputContexts = response.outputContexts;
      }

      console.log('✅ Webhook response generated:', {
        fulfillmentText: response.fulfillmentText.substring(0, 100) + '...',
        hasRichMessages: !!response.fulfillmentMessages,
        hasContexts: !!response.outputContexts
      });

      return dialogflowResponse;

    } catch (error) {
      console.error('❌ Webhook error:', error);
      
      return {
        fulfillmentText: "I'm sorry, I encountered an error while processing your request. Please try again later. 🤖"
      };
    }
  }

  // Extract user ID from Dialogflow session path
  private extractUserIdFromSession(sessionPath: string): string | null {
    try {
      // Session format: projects/PROJECT_ID/agent/sessions/SESSION_ID
      // We can encode user ID in session ID or extract from contexts
      const sessionId = sessionPath.split('/').pop();
      
      // If session ID contains user info (format: userId_timestamp)
      if (sessionId && sessionId.includes('_')) {
        return sessionId.split('_')[0];
      }
      
      return null;
    } catch (error) {
      console.warn('Could not extract user ID from session:', error);
      return null;
    }
  }

  // Create Express.js middleware for webhook endpoint
  createExpressMiddleware() {
    return async (req: any, res: any) => {
      try {
        console.log('📨 Webhook request received from Dialogflow');
        
        // Verify request is from Dialogflow (optional but recommended)
        if (!this.verifyDialogflowRequest(req)) {
          console.warn('⚠️ Unauthorized webhook request');
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const dialogflowRequest: DialogflowWebhookRequest = req.body;
        
        // Extract user ID from request or session
        const userId = req.headers['x-user-id'] || 
                      this.extractUserIdFromSession(dialogflowRequest.session) ||
                      'anonymous';

        // Process the webhook request
        const response = await this.handleWebhookRequest(dialogflowRequest, userId);

        // Send response back to Dialogflow
        res.json(response);

      } catch (error) {
        console.error('💥 Webhook middleware error:', error);
        res.status(500).json({
          fulfillmentText: "I'm sorry, I encountered an error. Please try again later."
        });
      }
    };
  }

  // Verify request is from Dialogflow (basic verification)
  private verifyDialogflowRequest(req: any): boolean {
    // In production, implement proper verification:
    // 1. Check request signature
    // 2. Verify source IP
    // 3. Check authentication headers
    
    // For now, basic check for required fields
    return req.body && 
           req.body.queryResult && 
           req.body.session &&
           req.body.responseId;
  }

  // Create webhook URL for Dialogflow console
  getWebhookUrl(baseUrl: string): string {
    return `${baseUrl}/api/dialogflow-webhook`;
  }

  // Test webhook connectivity
  async testWebhook(): Promise<boolean> {
    try {
      const testRequest: DialogflowWebhookRequest = {
        responseId: 'test-response-id',
        queryResult: {
          queryText: 'test message',
          action: 'input.welcome',
          parameters: {},
          allRequiredParamsPresent: true,
          fulfillmentText: '',
          fulfillmentMessages: [],
          outputContexts: [],
          intent: {
            name: 'projects/test/agent/intents/test',
            displayName: 'Test Intent'
          },
          intentDetectionConfidence: 1.0,
          languageCode: 'en'
        },
        originalDetectIntentRequest: {
          source: 'test',
          payload: {}
        },
        session: 'projects/test/agent/sessions/test-session'
      };

      const response = await this.handleWebhookRequest(testRequest, 'test-user');
      
      console.log('🧪 Webhook test result:', response);
      return !!response.fulfillmentText;

    } catch (error) {
      console.error('❌ Webhook test failed:', error);
      return false;
    }
  }
}

export const dialogflowWebhookServer = new DialogflowWebhookServer();

// Export for use in Express.js or other server frameworks
export default dialogflowWebhookServer;
