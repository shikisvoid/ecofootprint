#!/bin/bash

# Test script for Cloud Run Dialogflow integration
# Usage: ./test-cloud-run.sh [CLOUD_RUN_URL]

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get Cloud Run URL
if [ -z "$1" ]; then
    echo -e "${YELLOW}Please provide your Cloud Run URL:${NC}"
    echo "Usage: ./test-cloud-run.sh https://your-service-url.run.app"
    exit 1
fi

CLOUD_RUN_URL=$1
WEBHOOK_URL="$CLOUD_RUN_URL/api/dialogflow-webhook"
HEALTH_URL="$CLOUD_RUN_URL/health"

echo -e "${BLUE}🧪 Testing EcoCloudApp Cloud Run Deployment${NC}"
echo -e "${BLUE}📡 Cloud Run URL: $CLOUD_RUN_URL${NC}"
echo -e "${BLUE}🔗 Webhook URL: $WEBHOOK_URL${NC}"
echo "=================================================="

# Test 1: Health Check
echo -e "\n${YELLOW}🏥 Test 1: Health Check${NC}"
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/health_response.txt "$HEALTH_URL")
HTTP_CODE="${HEALTH_RESPONSE: -3}"

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Health check passed (HTTP $HTTP_CODE)${NC}"
    cat /tmp/health_response.txt | jq . 2>/dev/null || cat /tmp/health_response.txt
else
    echo -e "${RED}❌ Health check failed (HTTP $HTTP_CODE)${NC}"
    cat /tmp/health_response.txt
fi

# Test 2: Webhook Endpoint
echo -e "\n${YELLOW}🤖 Test 2: Webhook Endpoint${NC}"
WEBHOOK_PAYLOAD='{
  "responseId": "test-response-id",
  "queryResult": {
    "queryText": "hello",
    "action": "input.welcome",
    "parameters": {},
    "allRequiredParamsPresent": true,
    "fulfillmentText": "",
    "fulfillmentMessages": [],
    "outputContexts": [],
    "intent": {
      "name": "projects/test/agent/intents/welcome",
      "displayName": "Default Welcome Intent"
    },
    "intentDetectionConfidence": 1.0,
    "languageCode": "en"
  },
  "originalDetectIntentRequest": {
    "source": "test",
    "payload": {}
  },
  "session": "projects/test/agent/sessions/test-session"
}'

WEBHOOK_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/webhook_response.txt \
    -X POST \
    -H "Content-Type: application/json" \
    -d "$WEBHOOK_PAYLOAD" \
    "$WEBHOOK_URL")

HTTP_CODE="${WEBHOOK_RESPONSE: -3}"

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Webhook test passed (HTTP $HTTP_CODE)${NC}"
    echo "Response:"
    cat /tmp/webhook_response.txt | jq . 2>/dev/null || cat /tmp/webhook_response.txt
else
    echo -e "${RED}❌ Webhook test failed (HTTP $HTTP_CODE)${NC}"
    cat /tmp/webhook_response.txt
fi

# Test 3: Carbon Footprint Query
echo -e "\n${YELLOW}📊 Test 3: Carbon Footprint Query${NC}"
CARBON_PAYLOAD='{
  "responseId": "test-carbon-id",
  "queryResult": {
    "queryText": "what is my carbon footprint",
    "action": "get.carbon.footprint",
    "parameters": {
      "time_period": "this month"
    },
    "intent": {
      "name": "projects/test/agent/intents/carbon",
      "displayName": "Get Carbon Footprint"
    }
  },
  "session": "projects/test/agent/sessions/test-session"
}'

CARBON_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/carbon_response.txt \
    -X POST \
    -H "Content-Type: application/json" \
    -d "$CARBON_PAYLOAD" \
    "$WEBHOOK_URL")

HTTP_CODE="${CARBON_RESPONSE: -3}"

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Carbon footprint query passed (HTTP $HTTP_CODE)${NC}"
    echo "Response:"
    cat /tmp/carbon_response.txt | jq . 2>/dev/null || cat /tmp/carbon_response.txt
else
    echo -e "${RED}❌ Carbon footprint query failed (HTTP $HTTP_CODE)${NC}"
    cat /tmp/carbon_response.txt
fi

# Test 4: App Accessibility
echo -e "\n${YELLOW}🌐 Test 4: App Accessibility${NC}"
APP_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/app_response.txt "$CLOUD_RUN_URL")
HTTP_CODE="${APP_RESPONSE: -3}"

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ App is accessible (HTTP $HTTP_CODE)${NC}"
    # Check if it's the React app
    if grep -q "EcoCloudApp" /tmp/app_response.txt; then
        echo -e "${GREEN}✅ React app is loading correctly${NC}"
    else
        echo -e "${YELLOW}⚠️ App loaded but may not be the React app${NC}"
    fi
else
    echo -e "${RED}❌ App is not accessible (HTTP $HTTP_CODE)${NC}"
fi

# Summary
echo -e "\n${BLUE}=================================================="
echo -e "📋 Test Summary${NC}"
echo -e "${BLUE}=================================================="

# Count successful tests
TESTS_PASSED=0
if [ "$(curl -s -w "%{http_code}" -o /dev/null "$HEALTH_URL")" = "200" ]; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi

if [ "$(curl -s -w "%{http_code}" -o /dev/null -X POST -H "Content-Type: application/json" -d "$WEBHOOK_PAYLOAD" "$WEBHOOK_URL")" = "200" ]; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi

if [ "$(curl -s -w "%{http_code}" -o /dev/null -X POST -H "Content-Type: application/json" -d "$CARBON_PAYLOAD" "$WEBHOOK_URL")" = "200" ]; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi

if [ "$(curl -s -w "%{http_code}" -o /dev/null "$CLOUD_RUN_URL")" = "200" ]; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi

echo -e "${GREEN}✅ Tests passed: $TESTS_PASSED/4${NC}"

if [ $TESTS_PASSED -eq 4 ]; then
    echo -e "${GREEN}🎉 All tests passed! Your Cloud Run deployment is working correctly.${NC}"
    echo -e "\n${BLUE}🔗 Next steps:${NC}"
    echo "1. Configure Dialogflow webhook URL: $WEBHOOK_URL"
    echo "2. Enable webhook for your intents in Dialogflow Console"
    echo "3. Test the chatbot in your deployed app: $CLOUD_RUN_URL"
else
    echo -e "${RED}⚠️ Some tests failed. Check the logs above for details.${NC}"
    echo -e "\n${BLUE}🔧 Troubleshooting:${NC}"
    echo "1. Check Cloud Run logs: gcloud logs read --service=eco-footprint-app"
    echo "2. Verify environment variables in Cloud Run console"
    echo "3. Ensure all required APIs are enabled"
fi

# Cleanup
rm -f /tmp/health_response.txt /tmp/webhook_response.txt /tmp/carbon_response.txt /tmp/app_response.txt

echo -e "\n${BLUE}📚 For more help, see: CLOUD_RUN_DIALOGFLOW_SETUP.md${NC}"
