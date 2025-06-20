# Dialogflow ES Deployment Checklist

## Pre-Deployment Verification

### ✅ **Code Integration Complete**
- [x] Dialogflow service implemented (`src/services/dialogflowService.ts`)
- [x] Webhook service implemented (`src/services/webhookService.ts`)
- [x] ChatBot component created (`src/components/ChatBot.tsx`)
- [x] useDialogflow hook implemented (`src/hooks/useDialogflow.ts`)
- [x] AuthContext updated (`src/contexts/AuthContext.tsx`)
- [x] Dependencies added to package.json
- [x] Environment variables template created (`.env.example`)

### ✅ **Dialogflow Configuration Ready**
- [x] Agent configuration (`dialogflow/agent.json`)
- [x] 8 Core intents defined
- [x] 2 Custom entities created
- [x] Package configuration (`dialogflow/package.json`)

### ✅ **Documentation Complete**
- [x] Setup guide (`DIALOGFLOW_SETUP.md`)
- [x] Testing guide (`DIALOGFLOW_TESTING.md`)
- [x] Test suite (`src/tests/dialogflow.test.ts`)

## Deployment Steps

### 1. **Google Cloud Setup** ⏳
- [ ] Google Cloud Project created with billing enabled
- [ ] Dialogflow API enabled
- [ ] Service account created with proper permissions
- [ ] Service account key downloaded

### 2. **Dialogflow ES Agent Setup** ⏳
- [ ] Dialogflow ES agent created
- [ ] Agent configuration imported (zip `dialogflow/` contents)
- [ ] Webhook URL configured
- [ ] Test in Dialogflow simulator

### 3. **Environment Configuration** ⏳
- [ ] `.env` file created from template
- [ ] All required environment variables filled
- [ ] Firebase configuration verified
- [ ] API keys validated

### 4. **Application Testing** ⏳
- [ ] Development server starts successfully
- [ ] User authentication works
- [ ] ChatBot component appears
- [ ] All intents respond correctly
- [ ] Data integration functions properly

### 5. **Production Deployment** ⏳
- [ ] Application deployed to production
- [ ] Webhook URL updated in Dialogflow
- [ ] Production environment variables set
- [ ] SSL certificate configured
- [ ] Final end-to-end testing completed

## Quick Verification Commands

```bash
# 1. Check dependencies
npm list @google-cloud/dialogflow uuid

# 2. Verify environment template
cat .env.example

# 3. Test development server
npm run dev

# 4. Check for TypeScript errors
npx tsc --noEmit

# 5. Verify file structure
ls -la dialogflow/
ls -la src/services/dialogflow*
ls -la src/components/ChatBot.tsx
```

## Common Issues and Solutions

### Issue: "Module not found" errors
**Solution**: Run `npm install` to ensure all dependencies are installed

### Issue: ChatBot not appearing
**Solution**: 
- Check if user is authenticated
- Verify AuthContext is properly wrapped around the app
- Check browser console for errors

### Issue: Dialogflow responses not working
**Solution**:
- Verify webhook URL is correct
- Check that intents are properly imported
- Test individual intents in Dialogflow simulator

### Issue: Environment variables not loading
**Solution**:
- Ensure `.env` file is in project root
- Verify all required variables are set
- Restart development server after changes

## Success Indicators

### ✅ **Technical Success**
- No TypeScript compilation errors
- All services import correctly
- ChatBot renders without errors
- Webhook responses are received

### ✅ **Functional Success**
- Users can open chat interface
- Bot responds to welcome messages
- Carbon tracking conversations work
- Environmental data queries function
- Recommendations are provided

### ✅ **Integration Success**
- User authentication flows properly
- Carbon entries are saved to database
- Real-time environmental data is fetched
- User-specific responses are generated

## Performance Benchmarks

- **Initial load time**: < 3 seconds
- **Chat interface open**: < 1 second
- **Message response time**: < 2 seconds
- **Data query response**: < 3 seconds

## Security Checklist

- [ ] Environment variables secured
- [ ] Service account permissions minimal
- [ ] User input sanitization implemented
- [ ] HTTPS enabled for webhook
- [ ] Authentication verified for all requests

## Post-Deployment Monitoring

### Metrics to Track
- Conversation engagement rate
- Intent recognition accuracy
- Response time performance
- Error rates and types
- User satisfaction feedback

### Logging Points
- Session creation/destruction
- Intent matching success/failure
- Webhook call success/failure
- Database operation results
- User authentication events

## Rollback Plan

If issues occur after deployment:

1. **Immediate**: Disable ChatBot component
2. **Short-term**: Revert to previous deployment
3. **Investigation**: Check logs and error reports
4. **Fix**: Address issues in development
5. **Re-deploy**: Test thoroughly before re-enabling

## Support Resources

- **Dialogflow Documentation**: https://cloud.google.com/dialogflow/docs
- **Firebase Documentation**: https://firebase.google.com/docs
- **Project Setup Guide**: `DIALOGFLOW_SETUP.md`
- **Testing Guide**: `DIALOGFLOW_TESTING.md`
- **Test Suite**: `src/tests/dialogflow.test.ts`

---

**Ready for deployment when all checkboxes are completed! 🚀**
