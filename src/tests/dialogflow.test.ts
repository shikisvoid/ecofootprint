// Test file for Dialogflow integration
// Run these tests to verify the conversational AI functionality

import { dialogflowService } from '../services/dialogflowService';
import { webhookService } from '../services/webhookService';

// Mock user ID for testing
const TEST_USER_ID = 'test-user-123';

// Test conversation scenarios
export const testDialogflowIntegration = async () => {
  console.log('🧪 Starting Dialogflow Integration Tests...\n');

  try {
    // Test 1: Create session
    console.log('Test 1: Creating new session...');
    const sessionId = dialogflowService.createSession(TEST_USER_ID);
    console.log(`✅ Session created: ${sessionId}\n`);

    // Test 2: Welcome message
    console.log('Test 2: Testing welcome intent...');
    const welcomeResponse = await dialogflowService.sendMessage(sessionId, 'Hello', TEST_USER_ID);
    console.log(`✅ Welcome response: ${welcomeResponse.text}\n`);

    // Test 3: Carbon footprint query
    console.log('Test 3: Testing carbon footprint query...');
    const carbonResponse = await dialogflowService.sendMessage(sessionId, "What's my carbon footprint this month?", TEST_USER_ID);
    console.log(`✅ Carbon footprint response: ${carbonResponse.text}\n`);

    // Test 4: Add carbon entry
    console.log('Test 4: Testing add carbon entry...');
    const addEntryResponse = await dialogflowService.sendMessage(sessionId, 'I drove 25 km today', TEST_USER_ID);
    console.log(`✅ Add entry response: ${addEntryResponse.text}\n`);

    // Test 5: Environmental data query
    console.log('Test 5: Testing environmental data query...');
    const envDataResponse = await dialogflowService.sendMessage(sessionId, "How's the air quality?", TEST_USER_ID);
    console.log(`✅ Environmental data response: ${envDataResponse.text}\n`);

    // Test 6: Recommendations
    console.log('Test 6: Testing recommendations...');
    const recommendationsResponse = await dialogflowService.sendMessage(sessionId, 'Give me tips to reduce emissions', TEST_USER_ID);
    console.log(`✅ Recommendations response: ${recommendationsResponse.text}\n`);

    // Test 7: Small talk
    console.log('Test 7: Testing small talk...');
    const smallTalkResponse = await dialogflowService.sendMessage(sessionId, 'How are you?', TEST_USER_ID);
    console.log(`✅ Small talk response: ${smallTalkResponse.text}\n`);

    // Test 8: Fallback intent
    console.log('Test 8: Testing fallback intent...');
    const fallbackResponse = await dialogflowService.sendMessage(sessionId, 'xyz random text 123', TEST_USER_ID);
    console.log(`✅ Fallback response: ${fallbackResponse.text}\n`);

    // Test 9: Conversation history
    console.log('Test 9: Testing conversation history...');
    const history = dialogflowService.getConversationHistory(sessionId);
    console.log(`✅ Conversation history: ${history.length} messages\n`);

    // Test 10: Clear session
    console.log('Test 10: Clearing session...');
    dialogflowService.clearSession(sessionId);
    console.log(`✅ Session cleared\n`);

    console.log('🎉 All Dialogflow tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Test webhook functionality
export const testWebhookService = async () => {
  console.log('🧪 Starting Webhook Service Tests...\n');

  try {
    // Test webhook request structure
    const testRequest = {
      queryResult: {
        queryText: "What's my carbon footprint?",
        action: 'get.carbon.footprint',
        parameters: {
          time_period: 'this month'
        },
        intent: {
          displayName: 'Get Carbon Footprint'
        }
      },
      session: 'test-session'
    };

    console.log('Test 1: Testing webhook carbon footprint handler...');
    const response = await webhookService.handleWebhook(testRequest, TEST_USER_ID);
    console.log(`✅ Webhook response: ${response.fulfillmentText}\n`);

    // Test add carbon entry webhook
    const addEntryRequest = {
      queryResult: {
        queryText: 'I drove 25 km',
        action: 'add.carbon.entry',
        parameters: {
          category: 'transport',
          amount: 25
        },
        intent: {
          displayName: 'Add Carbon Entry'
        }
      },
      session: 'test-session'
    };

    console.log('Test 2: Testing webhook add entry handler...');
    const addResponse = await webhookService.handleWebhook(addEntryRequest, TEST_USER_ID);
    console.log(`✅ Add entry webhook response: ${addResponse.fulfillmentText}\n`);

    console.log('🎉 All webhook tests completed successfully!');

  } catch (error) {
    console.error('❌ Webhook test failed:', error);
  }
};

// Sample conversation flows for testing
export const sampleConversations = [
  {
    name: 'Carbon Tracking Flow',
    messages: [
      'Hello',
      "What's my carbon footprint this month?",
      'I want to track my transport emissions',
      'I drove 50 km today',
      'Show me my progress'
    ]
  },
  {
    name: 'Environmental Data Flow',
    messages: [
      'Hi there',
      "How's the air quality today?",
      'What about the weather?',
      'Show me carbon intensity data',
      'Give me environmental recommendations'
    ]
  },
  {
    name: 'Recommendations Flow',
    messages: [
      'Hello',
      'How can I reduce my carbon footprint?',
      'Give me transport tips',
      'What about energy saving tips?',
      'Help me go green'
    ]
  }
];

// Run sample conversations
export const runSampleConversations = async () => {
  console.log('🧪 Running Sample Conversations...\n');

  for (const conversation of sampleConversations) {
    console.log(`\n📝 Testing: ${conversation.name}`);
    console.log('=' .repeat(50));

    const sessionId = dialogflowService.createSession(TEST_USER_ID);

    for (const message of conversation.messages) {
      console.log(`\n👤 User: ${message}`);
      const response = await dialogflowService.sendMessage(sessionId, message, TEST_USER_ID);
      console.log(`🤖 Bot: ${response.text}`);
      
      // Add delay between messages for realistic conversation flow
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    dialogflowService.clearSession(sessionId);
    console.log('\n✅ Conversation completed');
  }

  console.log('\n🎉 All sample conversations completed!');
};

// Performance test
export const performanceTest = async () => {
  console.log('🧪 Running Performance Tests...\n');

  const sessionId = dialogflowService.createSession(TEST_USER_ID);
  const testMessages = [
    "What's my carbon footprint?",
    'I drove 25 km',
    "How's the air quality?",
    'Give me eco tips',
    'Show my achievements'
  ];

  const startTime = Date.now();

  for (let i = 0; i < testMessages.length; i++) {
    const messageStart = Date.now();
    await dialogflowService.sendMessage(sessionId, testMessages[i], TEST_USER_ID);
    const messageEnd = Date.now();
    console.log(`Message ${i + 1} response time: ${messageEnd - messageStart}ms`);
  }

  const endTime = Date.now();
  const totalTime = endTime - startTime;
  const averageTime = totalTime / testMessages.length;

  console.log(`\n📊 Performance Results:`);
  console.log(`Total time: ${totalTime}ms`);
  console.log(`Average response time: ${averageTime.toFixed(2)}ms`);
  console.log(`Messages per second: ${(testMessages.length / (totalTime / 1000)).toFixed(2)}`);

  dialogflowService.clearSession(sessionId);
  console.log('\n✅ Performance test completed');
};

// Export all test functions
export default {
  testDialogflowIntegration,
  testWebhookService,
  runSampleConversations,
  performanceTest,
  sampleConversations
};
