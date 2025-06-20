# Dialogflow ES Setup Guide for EcoCloudApp

This guide will help you set up a Dialogflow ES conversational agent for your EcoCloudApp carbon footprint tracking application.

## Prerequisites

1. **Google Cloud Project**: You need a Google Cloud Project with billing enabled
2. **Dialogflow API**: Enable the Dialogflow API in your Google Cloud Console
3. **Service Account**: Create a service account with Dialogflow API permissions
4. **Firebase Project**: Your existing Firebase project for user authentication

## Step 1: Create Dialogflow ES Agent

1. Go to [Dialogflow Console](https://dialogflow.cloud.google.com/)
2. Click "Create Agent"
3. Fill in the details:
   - **Agent name**: EcoCloudApp Assistant
   - **Default language**: English
   - **Default time zone**: Your preferred timezone
   - **Google project**: Select your Google Cloud project
4. Click "Create"

## Step 2: Import Agent Configuration

1. In the Dialogflow console, go to **Settings** (gear icon)
2. Click on the **Export and Import** tab
3. Click **Import From Zip**
4. Create a zip file containing all files from the `dialogflow/` directory:

   **For Windows PowerShell:**
   ```powershell
   cd dialogflow
   Compress-Archive -Path * -DestinationPath ../ecocloud-agent-enhanced.zip -Force
   ```

   **For Linux/Mac:**
   ```bash
   cd dialogflow
   zip -r ecocloud-agent-enhanced.zip .
   ```
5. Upload the zip file and click **Import**
6. Type "IMPORT" to confirm

## Step 3: Configure Webhook

1. In Dialogflow console, go to **Fulfillment**
2. Enable **Webhook**
3. Set the webhook URL to your deployed application:
   ```
   https://your-app-domain.com/api/dialogflow-webhook
   ```
4. Add headers if needed:
   ```
   Content-Type: application/json
   ```
5. Click **Save**

## Step 4: Set Up Environment Variables

Add these variables to your `.env` file:

```env
# Dialogflow Configuration
VITE_GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id
VITE_DIALOGFLOW_WEBHOOK_URL=https://your-domain.com/api/dialogflow-webhook
VITE_DIALOGFLOW_LANGUAGE_CODE=en

# Google Cloud Service Account (for server-side API calls)
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
```

## Step 5: Install Dependencies

The required dependencies are already added to `package.json`. Install them:

```bash
npm install
```

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Log into your EcoCloudApp
3. Look for the chat bot icon in the bottom-right corner
4. Click to open the chat interface
5. Try these sample queries:
   - "Hello"
   - "What's my carbon footprint this month?"
   - "I drove 25 km today"
   - "How's the air quality?"
   - "Give me tips to reduce emissions"

## Available Intents

### Core Intents
- **Default Welcome Intent**: Greets users and explains capabilities
- **Get Carbon Footprint**: Retrieves user's carbon emission data
- **Add Carbon Entry**: Helps users log new carbon activities
- **Get Environmental Data**: Provides air quality, weather, and carbon intensity
- **Get Recommendations**: Offers personalized eco-friendly tips
- **Get Reports**: Generates environmental reports
- **Get Achievements**: Shows user's badges and green points

### Small Talk Intents
- **How are you**: Friendly conversation starter
- **Default Fallback Intent**: Handles unrecognized queries

## Entities

### @carbon_categories
- transport, energy, food, waste
- Includes synonyms for natural language understanding

### @time_periods
- today, this week, this month, this year, etc.
- Used for filtering data by time ranges

## Webhook Actions

The webhook service handles these actions:

1. **get.carbon.footprint**: Retrieves and formats carbon footprint data
2. **add.carbon.entry**: Processes new carbon tracking entries
3. **get.environmental.data**: Fetches real-time environmental information
4. **get.recommendations**: Provides personalized sustainability tips
5. **get.reports**: Generates environmental reports
6. **get.achievements**: Shows user progress and rewards

## Customization

### Adding New Intents

1. Create a new JSON file in `dialogflow/intents/`
2. Follow the existing intent structure
3. Add training phrases and parameters
4. Update the webhook service to handle the new action
5. Re-import the agent configuration

### Modifying Responses

1. Edit the intent JSON files in `dialogflow/intents/`
2. Update the webhook service in `src/services/webhookService.ts`
3. Modify response templates in `src/config/dialogflow.ts`

### Adding New Entities

1. Create entity JSON files in `dialogflow/entities/`
2. Reference them in intent parameters
3. Update the webhook service to handle new entity values

## Deployment Considerations

### Production Webhook

For production deployment:

1. Deploy your app to Google Cloud Run, Vercel, or your preferred platform
2. Update the webhook URL in Dialogflow console
3. Ensure HTTPS is enabled
4. Set up proper authentication if needed

### Security

1. Validate webhook requests from Dialogflow
2. Implement rate limiting
3. Sanitize user inputs
4. Use environment variables for sensitive data

### Monitoring

1. Enable Dialogflow analytics
2. Monitor webhook response times
3. Track conversation metrics
4. Set up error logging

## Troubleshooting

### Common Issues

1. **Webhook not responding**:
   - Check if your server is running
   - Verify the webhook URL is correct
   - Check server logs for errors

2. **Intents not matching**:
   - Review training phrases
   - Check entity annotations
   - Test in Dialogflow simulator

3. **Authentication errors**:
   - Verify service account permissions
   - Check environment variables
   - Ensure Firebase is properly configured

### Testing

Use the Dialogflow simulator to test intents before deploying:

1. Go to Dialogflow console
2. Use the simulator on the right side
3. Type test queries and verify responses
4. Check if webhook is being called correctly

## Advanced Features

### Multi-language Support

To add more languages:

1. Create additional language versions in Dialogflow
2. Translate intent training phrases
3. Update webhook to handle different languages
4. Modify frontend to support language selection

### Voice Integration

To add voice capabilities:

1. Enable Google Assistant integration
2. Configure voice-specific responses
3. Add SSML for better speech synthesis
4. Test with Google Assistant simulator

### Analytics Integration

Track conversation metrics:

1. Enable Dialogflow analytics
2. Integrate with Google Analytics
3. Track custom events in webhook
4. Monitor user engagement patterns

## Support

For issues with this integration:

1. Check the Dialogflow documentation
2. Review Google Cloud logs
3. Test individual components
4. Verify environment configuration

## Next Steps

1. **Enhanced NLU**: Add more training phrases for better intent recognition
2. **Context Management**: Implement conversation context for multi-turn dialogs
3. **Rich Responses**: Add cards, quick replies, and multimedia responses
4. **Integration**: Connect with more environmental APIs and services
5. **Personalization**: Implement user-specific response customization
