# Dialogflow ES Testing Guide for EcoCloudApp

This guide provides comprehensive testing instructions for the Dialogflow ES conversational agent integration.

## Quick Start Testing

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Access the ChatBot

1. Open your browser and navigate to `http://localhost:5173`
2. Log in to your EcoCloudApp account
3. Look for the chat bot icon (💬) in the bottom-right corner
4. Click the icon to open the chat interface

### 3. Test Basic Functionality

Try these sample conversations:

**Welcome & Introduction:**
```
User: Hello
Bot: Hello! I'm your EcoCloudApp assistant...

User: What can you help me with?
Bot: I can help you with carbon footprint tracking...
```

**Carbon Footprint Queries:**
```
User: What's my carbon footprint this month?
Bot: Your total carbon footprint this month: X.X kg CO₂...

User: Show me my transport emissions
Bot: Your transport emissions this month: X.X kg CO₂...
```

**Adding Carbon Entries:**
```
User: I drove 25 km today
Bot: ✅ Added 25 km of Car (Petrol) to your carbon tracking!

User: I used 15 kWh of electricity
Bot: ✅ Added 15 kWh of Electricity to your carbon tracking!
```

**Environmental Data:**
```
User: How's the air quality?
Bot: 🌬️ Air Quality in [Location]: AQI: XX (Status)...

User: What's the weather like?
Bot: 🌤️ Weather in [Location]: Temperature: XX°C...
```

**Recommendations:**
```
User: How can I reduce my carbon footprint?
Bot: 💡 Here are some general tips to reduce your carbon footprint...

User: Give me transport tips
Bot: 💡 Here are some tips to reduce your transport emissions...
```

## Advanced Testing Scenarios

### 1. Multi-turn Conversations

Test context awareness and follow-up questions:

```
User: What's my carbon footprint?
Bot: Your total carbon footprint this month: X.X kg CO₂...

User: What about last month?
Bot: [Should handle time period context]

User: Show me just transport
Bot: [Should filter by transport category]
```

### 2. Parameter Extraction

Test entity recognition:

```
User: I drove 50 kilometers yesterday
Bot: [Should extract: category=transport, amount=50, time=yesterday]

User: Used 20 kWh of electricity this week
Bot: [Should extract: category=energy, amount=20, time=this week]
```

### 3. Error Handling

Test fallback scenarios:

```
User: xyz random text 123
Bot: I'm not sure I understand. I can help you with...

User: [Empty message]
Bot: [Should handle gracefully]
```

### 4. Small Talk

Test conversational capabilities:

```
User: How are you?
Bot: I'm doing great! I'm excited to help you track...

User: Thank you
Bot: [Should respond appropriately]
```

## Automated Testing

### Run Test Suite

Execute the automated test suite:

```bash
# In browser console or Node.js environment
import dialogflowTests from './src/tests/dialogflow.test.ts';

// Run all tests
await dialogflowTests.testDialogflowIntegration();
await dialogflowTests.testWebhookService();
await dialogflowTests.runSampleConversations();
await dialogflowTests.performanceTest();
```

### Test Results to Expect

1. **Session Management**: ✅ Session creation and cleanup
2. **Intent Recognition**: ✅ Proper intent matching for all test cases
3. **Webhook Integration**: ✅ Successful webhook calls and responses
4. **Response Quality**: ✅ Meaningful and helpful responses
5. **Performance**: ✅ Response times under 2 seconds

## Integration Testing

### 1. Database Integration

Verify data persistence:

```
User: I drove 30 km today
Bot: ✅ Added 30 km of Car (Petrol)...

# Check database
- New carbon entry should be created
- User's green points should increase
- Total CO₂ saved should update
```

### 2. Service Integration

Test external API calls:

```
User: How's the air quality?
# Should call environmentalDataService.getAirQuality()

User: What's the weather?
# Should call environmentalDataService.getWeatherData()
```

### 3. Authentication

Test user-specific responses:

```
# Logged in user
User: What's my carbon footprint?
Bot: [Should show user's actual data]

# Different user
User: What's my carbon footprint?
Bot: [Should show different user's data]
```

## Performance Testing

### Response Time Benchmarks

- **Simple queries** (welcome, small talk): < 500ms
- **Data queries** (carbon footprint): < 1500ms
- **Complex operations** (reports, calculations): < 2000ms

### Load Testing

Test with multiple concurrent conversations:

```bash
# Simulate 10 concurrent users
for i in {1..10}; do
  # Create session and send messages
  # Monitor response times and error rates
done
```

## Troubleshooting Common Issues

### 1. ChatBot Not Appearing

**Symptoms**: Chat icon not visible
**Solutions**:
- Check if user is logged in
- Verify AuthContext is properly configured
- Check browser console for errors

### 2. Messages Not Sending

**Symptoms**: Messages don't get responses
**Solutions**:
- Check network connectivity
- Verify dialogflowService is imported correctly
- Check browser console for JavaScript errors

### 3. Incorrect Responses

**Symptoms**: Bot gives wrong or generic responses
**Solutions**:
- Check intent training phrases
- Verify entity annotations
- Test in Dialogflow simulator first

### 4. Webhook Errors

**Symptoms**: "I encountered an error" messages
**Solutions**:
- Check webhook service implementation
- Verify database connections
- Check server logs for detailed errors

## Test Data Setup

### Sample Carbon Entries

Create test data for comprehensive testing:

```javascript
const testEntries = [
  { category: 'transport', activity: 'Car (Petrol)', amount: 25, co2Emission: 5.25 },
  { category: 'energy', activity: 'Electricity', amount: 15, co2Emission: 6.15 },
  { category: 'food', activity: 'Beef', amount: 0.5, co2Emission: 13.5 },
  { category: 'waste', activity: 'General Waste', amount: 2, co2Emission: 1.14 }
];
```

### Test User Profiles

Create users with different data patterns:

- **New User**: No carbon entries
- **Active User**: Multiple entries across categories
- **Power User**: Extensive tracking history

## Monitoring and Analytics

### Key Metrics to Track

1. **Conversation Metrics**:
   - Messages per session
   - Session duration
   - User engagement rate

2. **Intent Performance**:
   - Intent recognition accuracy
   - Fallback intent frequency
   - Most used intents

3. **Technical Metrics**:
   - Response times
   - Error rates
   - Webhook success rate

### Logging

Monitor these logs during testing:

```javascript
// Browser console
console.log('🤖 Dialogflow session created');
console.log('🗣️ User message sent');
console.log('🎯 Intent matched');
console.log('🔗 Webhook called');
console.log('✅ Response received');
```

## Production Testing Checklist

Before deploying to production:

- [ ] All automated tests pass
- [ ] Manual testing scenarios completed
- [ ] Performance benchmarks met
- [ ] Error handling verified
- [ ] Security testing completed
- [ ] Cross-browser compatibility checked
- [ ] Mobile responsiveness tested
- [ ] Accessibility features verified

## Continuous Testing

### Daily Smoke Tests

Run these tests daily:

1. Basic conversation flow
2. Carbon entry addition
3. Data retrieval queries
4. Error handling

### Weekly Comprehensive Tests

Run full test suite weekly:

1. All intent scenarios
2. Performance testing
3. Integration testing
4. User experience testing

## Support and Debugging

### Debug Mode

Enable debug logging:

```javascript
// In dialogflow config
const debugMode = true;

// Enhanced logging
if (debugMode) {
  console.log('Debug: Intent matched', intentName);
  console.log('Debug: Parameters extracted', parameters);
  console.log('Debug: Webhook response', response);
}
```

### Common Debug Commands

```javascript
// Check session state
dialogflowService.getConversationHistory(sessionId);

// Verify user authentication
console.log('Current user:', user);

// Test webhook directly
webhookService.handleWebhook(testRequest, userId);
```

This comprehensive testing approach ensures your Dialogflow ES integration works reliably and provides an excellent user experience for carbon footprint tracking conversations.
