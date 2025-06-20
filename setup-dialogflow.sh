#!/bin/bash

# Dialogflow ES Setup Script for EcoCloudApp
# This script guides you through the Dialogflow setup process

echo "🤖 Dialogflow ES Setup for EcoCloudApp"
echo "======================================"
echo ""

# Check if required tools are available
echo "🔍 Checking prerequisites..."

# Check if gcloud CLI is installed
if command -v gcloud &> /dev/null; then
    echo "✅ Google Cloud CLI found"
    GCLOUD_AVAILABLE=true
else
    echo "⚠️  Google Cloud CLI not found - you'll need to use the web console"
    GCLOUD_AVAILABLE=false
fi

# Check if zip is available
if command -v zip &> /dev/null; then
    echo "✅ Zip utility found"
    ZIP_AVAILABLE=true
else
    echo "⚠️  Zip utility not found - you'll need to create the archive manually"
    ZIP_AVAILABLE=false
fi

echo ""

# Step 1: Create Dialogflow agent archive
echo "📦 Step 1: Creating Dialogflow agent archive..."

if [ "$ZIP_AVAILABLE" = true ]; then
    cd dialogflow
    zip -r ../ecocloud-dialogflow-agent.zip .
    cd ..
    echo "✅ Created ecocloud-dialogflow-agent.zip"
else
    echo "❌ Please manually create a zip file from the dialogflow/ directory contents"
    echo "   Name it: ecocloud-dialogflow-agent.zip"
fi

echo ""

# Step 2: Google Cloud Project setup
echo "🌐 Step 2: Google Cloud Project Setup"
echo "Please complete these steps in Google Cloud Console:"
echo ""
echo "1. Go to https://console.cloud.google.com/"
echo "2. Select or create project: ecofootprint-6ac62"
echo "3. Enable the Dialogflow API:"
echo "   - Go to APIs & Services > Library"
echo "   - Search for 'Dialogflow API'"
echo "   - Click Enable"
echo ""

# Step 3: Service Account setup
echo "🔑 Step 3: Service Account Setup"
echo "Create a service account for Dialogflow:"
echo ""
echo "1. Go to IAM & Admin > Service Accounts"
echo "2. Click 'Create Service Account'"
echo "3. Name: 'ecocloud-dialogflow-service'"
echo "4. Grant roles:"
echo "   - Dialogflow API Admin"
echo "   - Dialogflow API Client"
echo "5. Create and download JSON key"
echo "6. Save as: service-account-key.json"
echo ""

# Step 4: Dialogflow Console setup
echo "🤖 Step 4: Dialogflow Console Setup"
echo "Set up your Dialogflow ES agent:"
echo ""
echo "1. Go to https://dialogflow.cloud.google.com/"
echo "2. Click 'Create Agent'"
echo "3. Agent settings:"
echo "   - Name: EcoCloudApp Assistant"
echo "   - Language: English"
echo "   - Time zone: Your preferred timezone"
echo "   - Google project: ecofootprint-6ac62"
echo "4. Click 'Create'"
echo ""

# Step 5: Import agent configuration
echo "📥 Step 5: Import Agent Configuration"
echo "Import the pre-configured intents and entities:"
echo ""
echo "1. In Dialogflow console, click the gear icon (Settings)"
echo "2. Go to 'Export and Import' tab"
echo "3. Click 'Import From Zip'"
echo "4. Upload: ecocloud-dialogflow-agent.zip"
echo "5. Type 'IMPORT' to confirm"
echo "6. Wait for import to complete"
echo ""

# Step 6: Configure webhook
echo "🔗 Step 6: Configure Webhook"
echo "Set up webhook for fulfillment:"
echo ""
echo "1. In Dialogflow console, go to 'Fulfillment'"
echo "2. Enable 'Webhook'"
echo "3. Set URL to: http://localhost:5173/api/dialogflow-webhook"
echo "   (Update this to your production URL when deploying)"
echo "4. Add headers:"
echo "   Content-Type: application/json"
echo "5. Click 'Save'"
echo ""

# Step 7: Test the agent
echo "🧪 Step 7: Test the Agent"
echo "Test your agent in Dialogflow simulator:"
echo ""
echo "1. Use the simulator on the right side of Dialogflow console"
echo "2. Try these test phrases:"
echo "   - 'Hello'"
echo "   - 'What's my carbon footprint?'"
echo "   - 'I drove 25 km today'"
echo "   - 'How's the air quality?'"
echo "3. Verify responses are working correctly"
echo ""

# Summary
echo "✅ Setup Complete!"
echo "================"
echo ""
echo "Your Dialogflow ES agent should now be configured with:"
echo "• 8 core intents for carbon footprint tracking"
echo "• 2 custom entities for categories and time periods"
echo "• Webhook integration for real-time data"
echo "• Comprehensive conversation flows"
echo ""
echo "Next steps:"
echo "1. Update GOOGLE_APPLICATION_CREDENTIALS in .env"
echo "2. Test the integration with 'npm run dev'"
echo "3. Follow DIALOGFLOW_TESTING.md for comprehensive testing"
echo ""
echo "🎉 Happy carbon tracking conversations!"
