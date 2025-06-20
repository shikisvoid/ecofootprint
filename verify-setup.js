#!/usr/bin/env node

/**
 * Dialogflow ES Setup Verification Script
 * Run this script to verify your Dialogflow integration is properly configured
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verifying Dialogflow ES Setup for EcoCloudApp...\n');

let allChecksPass = true;

// Helper function to check if file exists
function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`);
  if (!exists) allChecksPass = false;
  return exists;
}

// Helper function to check directory
function checkDirectory(dirPath, description) {
  const exists = fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  console.log(`${exists ? '✅' : '❌'} ${description}: ${dirPath}`);
  if (!exists) allChecksPass = false;
  return exists;
}

// Helper function to check package.json dependencies
function checkDependency(packageName) {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const hasInDeps = packageJson.dependencies && packageJson.dependencies[packageName];
    const hasInDevDeps = packageJson.devDependencies && packageJson.devDependencies[packageName];
    const exists = hasInDeps || hasInDevDeps;
    console.log(`${exists ? '✅' : '❌'} Dependency: ${packageName}`);
    if (!exists) allChecksPass = false;
    return exists;
  } catch (error) {
    console.log(`❌ Error reading package.json: ${error.message}`);
    allChecksPass = false;
    return false;
  }
}

// Helper function to check environment variables
function checkEnvTemplate() {
  if (!fs.existsSync('.env.example')) {
    console.log('❌ Environment template: .env.example not found');
    allChecksPass = false;
    return false;
  }
  
  const envContent = fs.readFileSync('.env.example', 'utf8');
  const requiredVars = [
    'VITE_GOOGLE_CLOUD_PROJECT_ID',
    'VITE_DIALOGFLOW_WEBHOOK_URL',
    'VITE_FIREBASE_API_KEY',
    'VITE_WEATHER_API_KEY'
  ];
  
  let allVarsPresent = true;
  requiredVars.forEach(varName => {
    const exists = envContent.includes(varName);
    console.log(`${exists ? '✅' : '❌'} Environment variable template: ${varName}`);
    if (!exists) {
      allChecksPass = false;
      allVarsPresent = false;
    }
  });
  
  return allVarsPresent;
}

console.log('📁 Checking Core Files...');
console.log('=' .repeat(50));

// Check core service files
checkFile('src/services/dialogflowService.ts', 'Dialogflow Service');
checkFile('src/services/webhookService.ts', 'Webhook Service');
checkFile('src/components/ChatBot.tsx', 'ChatBot Component');
checkFile('src/hooks/useDialogflow.ts', 'Dialogflow Hook');
checkFile('src/contexts/AuthContext.tsx', 'Auth Context');
checkFile('src/config/dialogflow.ts', 'Dialogflow Config');

console.log('\n📋 Checking Dialogflow Configuration...');
console.log('=' .repeat(50));

// Check Dialogflow configuration files
checkDirectory('dialogflow', 'Dialogflow Directory');
checkFile('dialogflow/agent.json', 'Agent Configuration');
checkFile('dialogflow/package.json', 'Dialogflow Package');
checkDirectory('dialogflow/intents', 'Intents Directory');
checkDirectory('dialogflow/entities', 'Entities Directory');

// Check specific intent files
const requiredIntents = [
  'Default Welcome Intent.json',
  'Get Carbon Footprint.json',
  'Add Carbon Entry.json',
  'Get Environmental Data.json',
  'Get Recommendations.json',
  'Default Fallback Intent.json'
];

requiredIntents.forEach(intent => {
  checkFile(`dialogflow/intents/${intent}`, `Intent: ${intent}`);
});

// Check entity files
const requiredEntities = [
  'carbon_categories.json',
  'time_periods.json'
];

requiredEntities.forEach(entity => {
  checkFile(`dialogflow/entities/${entity}`, `Entity: ${entity}`);
});

console.log('\n📦 Checking Dependencies...');
console.log('=' .repeat(50));

// Check required dependencies
checkDependency('@google-cloud/dialogflow');
checkDependency('uuid');
checkDependency('@types/uuid');

console.log('\n🔧 Checking Configuration...');
console.log('=' .repeat(50));

// Check environment configuration
checkEnvTemplate();
checkFile('package.json', 'Package Configuration');

console.log('\n📚 Checking Documentation...');
console.log('=' .repeat(50));

// Check documentation files
checkFile('DIALOGFLOW_SETUP.md', 'Setup Guide');
checkFile('DIALOGFLOW_TESTING.md', 'Testing Guide');
checkFile('DEPLOYMENT_CHECKLIST.md', 'Deployment Checklist');
checkFile('src/tests/dialogflow.test.ts', 'Test Suite');

console.log('\n🔍 Checking File Contents...');
console.log('=' .repeat(50));

// Check if main files have expected content
try {
  const dialogflowService = fs.readFileSync('src/services/dialogflowService.ts', 'utf8');
  const hasSessionManagement = dialogflowService.includes('createSession') && dialogflowService.includes('sendMessage');
  console.log(`${hasSessionManagement ? '✅' : '❌'} Dialogflow Service has session management`);
  if (!hasSessionManagement) allChecksPass = false;

  const webhookService = fs.readFileSync('src/services/webhookService.ts', 'utf8');
  const hasWebhookHandlers = webhookService.includes('handleWebhook') && webhookService.includes('get.carbon.footprint');
  console.log(`${hasWebhookHandlers ? '✅' : '❌'} Webhook Service has intent handlers`);
  if (!hasWebhookHandlers) allChecksPass = false;

  const chatBot = fs.readFileSync('src/components/ChatBot.tsx', 'utf8');
  const hasChatInterface = chatBot.includes('ChatBot') && chatBot.includes('dialogflowService');
  console.log(`${hasChatInterface ? '✅' : '❌'} ChatBot Component has proper interface`);
  if (!hasChatInterface) allChecksPass = false;

} catch (error) {
  console.log(`❌ Error checking file contents: ${error.message}`);
  allChecksPass = false;
}

console.log('\n' + '=' .repeat(60));

if (allChecksPass) {
  console.log('🎉 SUCCESS: All checks passed! Your Dialogflow ES setup is ready.');
  console.log('\n📋 Next Steps:');
  console.log('1. Follow DIALOGFLOW_SETUP.md to create your Dialogflow agent');
  console.log('2. Configure your .env file with actual values');
  console.log('3. Run "npm run dev" to test the integration');
  console.log('4. Follow DIALOGFLOW_TESTING.md for comprehensive testing');
} else {
  console.log('❌ ISSUES FOUND: Please address the failed checks above.');
  console.log('\n🔧 Common Solutions:');
  console.log('- Run "npm install" to install missing dependencies');
  console.log('- Check that all files were created correctly');
  console.log('- Verify the Dialogflow configuration structure');
  console.log('- Ensure environment template includes all required variables');
}

console.log('\n📞 Need Help?');
console.log('- Check DIALOGFLOW_SETUP.md for detailed setup instructions');
console.log('- Review DIALOGFLOW_TESTING.md for testing guidance');
console.log('- Use DEPLOYMENT_CHECKLIST.md for deployment steps');

process.exit(allChecksPass ? 0 : 1);
