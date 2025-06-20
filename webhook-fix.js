// Simple Webhook Fix for Dialogflow
// Copy this into the Dialogflow Inline Editor

const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  
  function welcome(agent) {
    agent.add('👋 Welcome to EcoCloudApp AI Assistant! I can help you track your carbon footprint and provide environmental insights. How can I assist you today?');
  }
  
  function fallback(agent) {
    agent.add('I didn\'t understand that. Can you try rephrasing your question about carbon tracking or environmental data?');
  }
  
  function carbonFootprint(agent) {
    agent.add('🌱 Your current carbon footprint is 2.3 tons CO2/month. That\'s 15% lower than last month - great progress! Would you like specific reduction tips?');
  }
  
  function environmentalData(agent) {
    agent.add('🌍 Current environmental data:\n• Air Quality: Good (AQI: 45)\n• Weather: 22°C, Clear\n• Carbon Intensity: Low\n\nWould you like more detailed information?');
  }
  
  function recommendations(agent) {
    agent.add('💡 Here are personalized recommendations:\n• Use public transport 2 more days/week\n• Reduce heating by 2°C\n• Try plant-based meals twice weekly\n\nThese changes could reduce your footprint by 0.6 tons/month!');
  }
  
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Carbon Footprint Query', carbonFootprint);
  intentMap.set('Environmental Data Query', environmentalData);
  intentMap.set('Get Recommendations', recommendations);
  
  agent.handleRequest(intentMap);
});
