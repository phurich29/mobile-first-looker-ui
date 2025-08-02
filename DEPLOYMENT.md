# 🚀 Deployment Guide for RiceFlow Setup

## Production Deployment to setup.riceflow.app

### 1. Prerequisites
- GitHub repository updated with latest changes
- OneSignal production App ID configured: `1061c7a8-e7ac-480c-9e2b-eb4b4b92e30a`
- Domain `setup.riceflow.app` ready for deployment

### 2. Build for Production

```bash
# Build with production environment
npm run build:deploy
```

This will:
- Use production OneSignal App ID: `1061c7a8-e7ac-480c-9e2b-eb4b4b92e30a`
- Generate optimized build in `dist/` folder
- Configure for HTTPS domain: `setup.riceflow.app`

### 3. OneSignal Dashboard Configuration

**IMPORTANT**: Configure OneSignal production app with:

1. **Site URL**: `https://setup.riceflow.app`
2. **Local Testing**: `OFF` (production mode)
3. **Auto Resubscribe**: `ON`
4. **HTTPS Required**: `YES`

### 4. Deploy to Server

1. Upload `dist/` folder contents to web server
2. Configure domain `setup.riceflow.app` to point to uploaded files
3. Ensure HTTPS is enabled (required for notifications)

### 5. Test Production Features

After deployment, test:

✅ **Notification Permission Popup** (appears after 3 seconds)
✅ **PWA Install Banner** (appears after 5 seconds)  
✅ **Browser Notification Permission** (works immediately)
✅ **OneSignal Subscription** (production App ID)
✅ **PWA Installation** (Add to Home Screen)

### 6. Production URLs

- **Main Site**: https://setup.riceflow.app
- **Equipment Page**: https://setup.riceflow.app/equipment
- **OneSignal Dashboard**: https://dashboard.onesignal.com

### 7. Features Ready for Production

🔔 **Notification System**:
- OneSignal integration with production App ID
- Browser permission popup
- Cross-platform notifications (iOS, Android, Desktop)

📱 **PWA Features**:
- Install banner for all platforms
- Offline support
- App-like experience

🎯 **User Experience**:
- 3-second delay for notification popup
- 5-second delay for PWA install banner
- Smooth permission flow

### 8. Troubleshooting

If notifications don't work:
1. Check OneSignal Dashboard settings
2. Verify HTTPS is enabled
3. Clear browser cache and try incognito mode
4. Check browser console for errors

---

**Ready for Production! 🚀**

The app is fully configured and ready to deploy to `setup.riceflow.app`
