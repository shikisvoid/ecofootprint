// Test script for Dialogflow webhook
// Run this to verify your webhook is working

const https = require('https');
const http = require('http');

// Configuration
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3001/api/dialogflow-webhook';
const TEST_CASES = [
  {
    name: 'Welcome Intent',
    request: {
      responseId: 'test-welcome',
      queryResult: {
        queryText: 'hello',
        action: 'input.welcome',
        parameters: {},
        allRequiredParamsPresent: true,
        fulfillmentText: '',
        fulfillmentMessages: [],
        outputContexts: [],
        intent: {
          name: 'projects/test/agent/intents/welcome',
          displayName: 'Default Welcome Intent'
        },
        intentDetectionConfidence: 1.0,
        languageCode: 'en'
      },
      originalDetectIntentRequest: {
        source: 'test',
        payload: {}
      },
      session: 'projects/test/agent/sessions/test-session'
    }
  },
  {
    name: 'Carbon Footprint Query',
    request: {
      responseId: 'test-carbon',
      queryResult: {
        queryText: 'what is my carbon footprint',
        action: 'get.carbon.footprint',
        parameters: {
          time_period: 'this month'
        },
        allRequiredParamsPresent: true,
        fulfillmentText: '',
        fulfillmentMessages: [],
        outputContexts: [],
        intent: {
          name: 'projects/test/agent/intents/carbon-footprint',
          displayName: 'Get Carbon Footprint'
        },
        intentDetectionConfidence: 0.95,
        languageCode: 'en'
      },
      originalDetectIntentRequest: {
        source: 'test',
        payload: {}
      },
      session: 'projects/test/agent/sessions/test-session'
    }
  },
  {
    name: 'Recommendations Request',
    request: {
      responseId: 'test-recommendations',
      queryResult: {
        queryText: 'give me some eco tips',
        action: 'get.recommendations',
        parameters: {},
        allRequiredParamsPresent: true,
        fulfillmentText: '',
        fulfillmentMessages: [],
        outputContexts: [],
        intent: {
          name: 'projects/test/agent/intents/recommendations',
          displayName: 'Get Recommendations'
        },
        intentDetectionConfidence: 0.92,
        languageCode: 'en'
      },
      originalDetectIntentRequest: {
        source: 'test',
        payload: {}
      },
      session: 'projects/test/agent/sessions/test-session'
    }
  }
];

// Test function
async function testWebhook(testCase) {
  return new Promise((resolve, reject) => {
    const url = new URL(WEBHOOK_URL);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const postData = JSON.stringify(testCase.request);
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'EcoCloudApp-Webhook-Tester/1.0'
      }
    };

    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            response: response,
            success: res.statusCode === 200 && response.fulfillmentText
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            response: data,
            success: false,
            error: 'Invalid JSON response'
          });
        }
      });
    });

    req.on('error', (error) => {
      reject({
        success: false,
        error: error.message
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject({
        success: false,
        error: 'Request timeout'
      });
    });

    req.write(postData);
    req.end();
  });
}

// Run all tests
async function runTests() {
  console.log('🧪 Testing Dialogflow Webhook');
  console.log('📡 Webhook URL:', WEBHOOK_URL);
  console.log('=' * 50);

  let passedTests = 0;
  let totalTests = TEST_CASES.length;

  for (const testCase of TEST_CASES) {
    console.log(`\n🔍 Testing: ${testCase.name}`);
    
    try {
      const result = await testWebhook(testCase);
      
      if (result.success) {
        console.log('✅ PASSED');
        console.log(`📝 Response: ${result.response.fulfillmentText.substring(0, 100)}...`);
        passedTests++;
      } else {
        console.log('❌ FAILED');
        console.log(`📝 Status: ${result.statusCode}`);
        console.log(`📝 Response: ${JSON.stringify(result.response).substring(0, 200)}...`);
        if (result.error) {
          console.log(`📝 Error: ${result.error}`);
        }
      }
    } catch (error) {
      console.log('❌ FAILED');
      console.log(`📝 Error: ${error.error || error.message}`);
    }
  }

  console.log('\n' + '=' * 50);
  console.log(`📊 Test Results: ${passedTests}/${totalTests} passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Your webhook is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Check your webhook server and configuration.');
  }
}

// Health check function
async function healthCheck() {
  const healthUrl = WEBHOOK_URL.replace('/api/dialogflow-webhook', '/health');
  
  console.log('🏥 Checking webhook server health...');
  console.log('📡 Health URL:', healthUrl);
  
  try {
    const url = new URL(healthUrl);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'GET',
      timeout: 5000
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Webhook server is healthy');
          runTests();
        } else {
          console.log(`❌ Health check failed: ${res.statusCode}`);
          console.log('📝 Response:', data);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Health check failed:', error.message);
      console.log('💡 Make sure your webhook server is running on the correct port');
    });

    req.end();
    
  } catch (error) {
    console.log('❌ Health check error:', error.message);
  }
}

// Main execution
if (require.main === module) {
  console.log('🚀 Starting Dialogflow Webhook Tests');
  healthCheck();
}

module.exports = { testWebhook, runTests, healthCheck };
