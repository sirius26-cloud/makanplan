# MakanPlan Deployment Guide

## Current Status: Web Preview (Temporary Link)

The link you're using (`https://8081-...sg1.manus.computer`) is a **temporary preview** for development and testing. Here's what you need to know:

### Link Expiry

**Yes, the link will expire.** Temporary preview links are active for the current session only and will become unavailable when:
- Your browser session ends
- The development server stops
- You close the project
- More than 24 hours pass (session timeout)

### Three Ways to Use MakanPlan

#### Option 1: Web Browser (Current - Temporary)
- **How:** Use the preview link in your browser
- **Duration:** Temporary (current session only)
- **Best for:** Quick testing and trying features
- **Pros:** No installation needed, works on any device with a browser
- **Cons:** Link expires, requires internet connection

#### Option 2: Mobile App via Expo Go (Recommended for Testing)
- **How:** 
  1. Install **Expo Go** app on your iOS or Android device (free from App Store or Google Play)
  2. Open the Management UI and click "Preview"
  3. Scan the QR code with your phone camera
  4. Tap the link to open in Expo Go
- **Duration:** Works as long as the dev server is running
- **Best for:** Testing on your actual phone with realistic screen size
- **Pros:** Feels like a real app, works on your phone, free
- **Cons:** Requires internet connection to dev server, doesn't persist after dev server stops

#### Option 3: Native iOS/Android App (Permanent - Requires Publishing)
- **How:**
  1. Click the **Publish** button in the Management UI (top-right)
  2. The system will build and generate an APK (Android) or IPA (iOS)
  3. Install on your phone or share with others
- **Duration:** Permanent (installed on your device)
- **Best for:** Daily use, sharing with family, offline use
- **Pros:** Works offline, permanent installation, can share with others
- **Cons:** Requires one-time build/publish, larger file size

## Recommended Setup for You

### For Development & Testing (Now)
1. Use **Expo Go** on your phone to test the app
2. Keep the dev server running while you're testing
3. Make changes and see them live on your phone

### For Daily Use (When Ready)
1. **Publish** the app to create a permanent build
2. Install on your iOS device
3. All data is stored locally on your phone (no cloud sync needed)

## How to Publish (Make It Permanent)

### Step 1: Create a Checkpoint
The system requires a checkpoint before publishing. If you haven't already:
1. Open the Management UI
2. Click "Settings" → "More" (⋯) → "Version History"
3. You should see recent checkpoints listed

### Step 2: Click Publish
1. In the Management UI header (top-right), click **Publish**
2. The system will build the app
3. You'll get download links for:
   - **iOS**: `.ipa` file (for iPhone/iPad)
   - **Android**: `.apk` file (for Android phones)

### Step 3: Install on Your Phone

**For iOS:**
1. Download the `.ipa` file on your computer
2. Use **Xcode** or **Apple Configurator 2** to install on your iPhone
3. Or use **TestFlight** if the app is shared via TestFlight link

**For Android:**
1. Download the `.apk` file on your phone
2. Open the file and tap "Install"
3. Allow installation from unknown sources if prompted

## Data & Privacy

### Where Is Your Data Stored?
- **All data is stored locally on your device** (phone or computer)
- No cloud sync, no servers, no login required
- Your recipes, meal plans, and grocery lists never leave your phone

### Is Your Data Safe?
- ✅ Your data is private (not shared with anyone)
- ✅ Your data persists even if you close the app
- ✅ Your data is backed up with your phone's backup (iCloud, Google Drive)

### Can You Backup Your Data?
Yes! Your data is automatically backed up:
- **iOS:** iCloud automatically backs up app data
- **Android:** Google Play automatically backs up app data

If you switch phones, your data will restore automatically.

## Offline Usage

Once published and installed, MakanPlan works **completely offline**:
- Generate meal plans ✅
- View recipes ✅
- Create grocery lists ✅
- Export lists ✅
- Adjust serving sizes ✅

No internet connection needed!

## Troubleshooting

### "Link expired" or "Page not found"
- The preview link is temporary
- Restart the dev server or use Expo Go instead
- Or publish the app for permanent use

### "Can't scan QR code"
- Make sure Expo Go is installed on your phone
- Try taking a screenshot of the QR code and opening it in Expo Go
- Or manually enter the URL: `exps://...` (shown in Management UI)

### "App won't install on my phone"
- For iOS: Make sure you're using the correct `.ipa` file and Xcode/Apple Configurator
- For Android: Allow installation from unknown sources in Settings
- Try downloading the file again

### "Data disappeared after reinstalling"
- If you reinstalled without backing up, local data is lost
- Always back up your phone before reinstalling apps
- Consider publishing the app so you have a permanent copy

## Summary

| Feature | Web Preview | Expo Go | Published App |
|---------|------------|---------|---------------|
| **Link Duration** | Temporary | While dev server runs | Permanent |
| **Installation** | None (browser) | Expo Go app | Direct install |
| **Offline** | No | No | Yes |
| **Sharing** | Link only | QR code | File or link |
| **Best For** | Quick testing | Phone testing | Daily use |
| **Data Backup** | No | No | Yes (automatic) |

## Next Steps

1. **Try Expo Go** on your phone for realistic testing
2. **Add your recipes** using the ADD_RECIPES_GUIDE.md
3. **When ready, publish** the app for permanent use
4. **Share with family** by publishing and sending them the app file

Enjoy using MakanPlan! 🍽️
