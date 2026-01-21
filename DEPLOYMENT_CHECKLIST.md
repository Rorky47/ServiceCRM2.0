# Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Code Quality
- [ ] All tests pass locally (`npm run lint`)
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Code reviewed and approved

### 2. Environment Variables
- [ ] All required variables documented
- [ ] Variables set in Railway dashboard
- [ ] DATABASE_URL configured (if using database)
- [ ] CLOUDINARY credentials set (if using image uploads)
- [ ] SKIP_JSON_MIGRATION set to 'true' (after first deploy)

### 3. Database
- [ ] Database migrations tested locally
- [ ] Database connection verified
- [ ] Backup created (if updating production)
- [ ] Migration rollback plan ready

### 4. Testing
- [ ] Health check endpoint works (`/api/health`)
- [ ] All critical pages load
- [ ] Forms submit correctly
- [ ] Image uploads work (if applicable)
- [ ] Admin functions work

### 5. Monitoring
- [ ] Health check endpoint configured in Railway
- [ ] Error tracking set up (if applicable)
- [ ] Alerts configured for critical errors
- [ ] Logging configured

### 6. Rollback Plan
- [ ] Previous version tagged in git
- [ ] Know how to rollback in Railway
- [ ] Database rollback script ready (if needed)

## 🚀 Deployment Steps

1. **Final Check**
   ```bash
   npm run lint
   npm run build
   npm run validate-env
   ```

2. **Commit Changes**
   ```bash
   git add .
   git commit -m "Deploy: [description of changes]"
   git push
   ```

3. **Monitor Deployment**
   - Watch Railway deployment logs
   - Check for build errors
   - Verify startup logs

4. **Post-Deployment Verification**
   - [ ] Health check returns 200: `https://your-app.railway.app/api/health`
   - [ ] Homepage loads
   - [ ] Critical features work
   - [ ] No errors in Railway logs

## 🚨 If Deployment Fails

1. **Check Railway Logs**
   - Look for error messages
   - Check startup sequence
   - Verify environment variables

2. **Check Health Endpoint**
   - Visit `/api/health`
   - See what's failing
   - Check database connectivity

3. **Rollback if Needed**
   - Railway Dashboard → Deployments
   - Find last working deployment
   - Click "Redeploy"

4. **Fix Issues**
   - Fix in development
   - Test locally
   - Redeploy

## 📊 Post-Deployment Monitoring

### First 5 Minutes
- [ ] Monitor Railway logs
- [ ] Check error rates
- [ ] Verify all endpoints respond
- [ ] Test critical user flows

### First Hour
- [ ] Monitor performance
- [ ] Check database connections
- [ ] Verify no memory leaks
- [ ] Check response times

### First 24 Hours
- [ ] Review error logs
- [ ] Check user reports
- [ ] Monitor resource usage
- [ ] Verify all features work

## 🔍 Health Check Endpoint

The health check endpoint (`/api/health`) returns:
- **200 OK**: App is healthy
- **200 OK (degraded)**: App works but database unavailable (falls back to JSON)
- **503 Service Unavailable**: App is unhealthy

Use this endpoint to:
- Monitor app health
- Set up alerts
- Verify deployments

## 🛡️ Safety Features

1. **Graceful Degradation**
   - Falls back to JSON files if database fails
   - App continues working even with partial failures

2. **Error Boundaries**
   - React error boundaries prevent full crashes
   - User-friendly error pages

3. **Process Signal Handling**
   - Graceful shutdown on SIGTERM/SIGINT
   - No zombie processes

4. **Environment Validation**
   - Validates env vars on startup
   - Clear error messages

5. **Health Checks**
   - Railway monitors `/api/health`
   - Automatic restart on failure
