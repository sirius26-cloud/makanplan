# MakanPlan — Local Setup Guide

This guide explains how to set up and run MakanPlan on your computer and test it on your device.

## Prerequisites

Before you start, ensure you have the following installed:

- **Node.js** (version 18 or higher) — Download from [nodejs.org](https://nodejs.org/)
- **npm** or **pnpm** (Node package manager) — Included with Node.js
- **Git** — Download from [git-scm.com](https://git-scm.com/)
- **Expo Go app** (for testing on your phone) — Available on [iOS App Store](https://apps.apple.com/app/expo-go/id982107779) or [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

## Step 1: Clone or Download the Project

If you have the project files, navigate to the project directory in your terminal:

```bash
cd /path/to/makanplan
```

## Step 2: Install Dependencies

Install all required packages:

```bash
pnpm install
```

Or if using npm:

```bash
npm install
```

## Step 3: Start the Development Server

Start the Expo development server:

```bash
pnpm dev
```

Or with npm:

```bash
npm run dev
```

You should see output like:

```
> app-template@1.0.0 dev
> concurrently -k "pnpm dev:server" "pnpm dev:metro"

[1]  LOG  [web] Logs will appear in the browser console
[1]  LOG  Metro waiting on http://localhost:8081
```

## Step 4: Test the App

### Option A: Web Browser (Quickest)

Open your browser and navigate to:

```
http://localhost:8081
```

You can now interact with MakanPlan in your browser. All data is stored locally on your computer.

### Option B: iOS/Android Device (via Expo Go)

1. **On your computer:** When the dev server is running, you'll see a QR code in the terminal output or in the browser.

2. **On your phone:**
   - Open the **Expo Go** app
   - Tap the **QR code scanner** icon
   - Scan the QR code from your terminal
   - The app will load on your device

3. **Test the app:** You can now use MakanPlan on your phone with full native features (haptic feedback, etc.).

## Step 5: Using MakanPlan

### First Time Setup

1. **Generate a Weekly Plan:**
   - Tap the "Home" tab
   - Tap "Generate Week"
   - Configure your preferences:
     - **People Count:** Select 1–4 (default 4)
     - **Number of Days:** Choose 5–7 days
     - **Protein Filter:** Optional (leave as "All" or pick a protein type)
     - **Include Rice/Noodle Days:** Toggle to include 1–2 rice/noodle one-pot meals
   - Tap "Generate Plan"

2. **View Your Weekly Plan:**
   - Your meal plan appears on the Home screen
   - Each day shows a coloured box with the main dish and vegetable side
   - Tap any day to see full recipes and adjust servings

3. **Adjust Recipe Servings:**
   - Tap a day to view the full recipes
   - At the top, select the number of people (pax)
   - All ingredient quantities scale automatically

4. **Rotate Dishes:**
   - If you don't like a suggested dish, tap "Rotate Dishes"
   - The app will suggest a different meal for that day
   - Rotate as many times as you like

5. **View Grocery List:**
   - Tap "View Grocery List" from the Home screen
   - All ingredients for the week are aggregated and grouped:
     - **Protein:** Meats, fish, tofu
     - **Veg:** Vegetables
     - **Pantry:** Staples (soy sauce, garlic, rice, etc.)
     - **Other:** Miscellaneous items
   - Check off items as you shop
   - Tap "Share List" to send to messaging apps

6. **Browse Recipes:**
   - Tap the "Recipes" tab to see all available recipes
   - Search by name or filter by:
     - **Recipe Type:** Main, Veg, Rice/Noodle
     - **Protein:** Chicken, Fish, Beef, Seafood, Tofu, Mixed
   - Tap a recipe to see full details
   - Mark recipes as **Favourite** (❤️) or **Staple** (⭐) to weight them higher in random selection

7. **Customize Settings:**
   - Tap the "Settings" tab
   - Set your **Default Servings** (1–4)
   - Manage **Pantry Staples** — items you always have in stock (won't appear in grocery list)
   - Add or remove staples as needed

## Data Storage

All your data (recipes, weekly plans, preferences) is stored **locally on your device**. There is **no cloud sync** or login required. This means:

- Your data persists when you close and reopen the app
- Your data is private and never sent to a server
- If you uninstall the app, your data will be lost (so make backups if needed)

## Troubleshooting

### "Cannot find module" error

If you see an error about missing modules:

```bash
pnpm install
```

Then restart the dev server:

```bash
pnpm dev
```

### App won't load on phone

1. Ensure your phone and computer are on the **same WiFi network**
2. Restart the Expo Go app
3. Scan the QR code again

### Changes aren't showing up

The app automatically reloads when you save files. If it doesn't:

1. Stop the dev server (Ctrl+C)
2. Restart it: `pnpm dev`
3. Refresh your browser or rescan the QR code

### Port 8081 is already in use

If you get an error that port 8081 is in use, you can specify a different port:

```bash
EXPO_PORT=8082 pnpm dev
```

Then access the app at `http://localhost:8082`

## Building for Production

Once you're happy with the app, you can build it for iOS or Android:

### iOS (requires macOS)

```bash
pnpm ios
```

### Android

```bash
pnpm android
```

For detailed build instructions, see the [Expo documentation](https://docs.expo.dev/build/introduction/).

## Next Steps

- **Customize recipes:** Edit recipes in the app or add new ones via the Recipe Library
- **Adjust preferences:** Update your pantry staples and default servings in Settings
- **Share feedback:** Let us know what features you'd like to see!

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the [Expo documentation](https://docs.expo.dev/)
3. Check the app's console logs for error messages

Happy meal planning! 🍽️
