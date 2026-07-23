# MakanPlan — Mobile App Interface Design

## Overview
MakanPlan is a weekly dinner planning app for Singapore home cooks (1–4 servings). Users maintain a recipe library, generate weekly meal plans, and create grocery lists.

---

## Screen List

1. **Home / Weekly Planner** — Main screen showing the generated week's meal plan
2. **Recipe Library** — Browse, search, and manage recipes
3. **Recipe Detail** — View recipe details, mark as favourite/staple
4. **Weekly Generator** — Configure and generate a new week's plan
5. **Grocery List** — View aggregated ingredients, check off items, share
6. **Settings** — App preferences (default servings, pantry staples)

---

## Primary Content and Functionality

### Home / Weekly Planner
- **Content:** 5–7 day cards showing main + veg side for each day
- **Functionality:**
  - Tap a day to see full details
  - Shuffle button to regenerate that day's meals
  - "Generate New Week" button to create a fresh plan
  - Quick access to Grocery List
- **Layout:** Vertical scroll, one day per card, clean spacing

### Recipe Library
- **Content:** Searchable list of recipes with tags (type, protein, hasVeg, isRice)
- **Functionality:**
  - Filter by protein type (chicken, fish, beef, seafood, tofu, mixed)
  - Toggle favourite/staple status
  - Tap to view full recipe
  - Add new recipe button
- **Layout:** FlatList with recipe cards, search bar at top

### Recipe Detail
- **Content:** Recipe name, ingredients, instructions, tags, favourite/staple toggle
- **Functionality:**
  - Mark/unmark as favourite or staple
  - Edit recipe (if needed)
  - Delete recipe
- **Layout:** ScrollView with sections

### Weekly Generator
- **Content:** Configuration form
- **Functionality:**
  - Select people count (1–4, default 4)
  - Select number of days (5–7)
  - Optional protein filter (all, chicken, fish, beef, seafood, tofu, mixed)
  - Toggle "Include rice/noodle days" (1–2 days)
  - "Generate Plan" button
- **Layout:** Form with inputs, button at bottom

### Grocery List
- **Content:** Grouped ingredients (Protein, Veg, Pantry, Other)
- **Functionality:**
  - Checkbox to mark items as bought
  - Share list (via system share sheet)
  - Clear checked items
  - Edit pantry staples
- **Layout:** Grouped sections with checkboxes

### Settings
- **Content:** App preferences
- **Functionality:**
  - Default servings (1–4)
  - Manage pantry staples (soy sauce, garlic, rice, etc.)
  - App info
- **Layout:** Simple list of toggles/inputs

---

## Key User Flows

### Flow 1: Generate Weekly Plan
1. User opens app → Home screen shows last week's plan (or empty)
2. User taps "Generate New Week"
3. Weekly Generator screen opens with default settings
4. User adjusts settings (people count, days, protein filter, rice days)
5. User taps "Generate Plan"
6. App generates plan and returns to Home screen
7. Home screen displays new week's meals

### Flow 2: Customize a Day
1. User taps a day card on Home screen
2. Day detail modal opens showing main + veg side
3. User taps "Shuffle" to regenerate that day
4. Day updates with new meals

### Flow 3: View Grocery List
1. User taps "Grocery List" from Home or tab bar
2. Grocery List screen shows aggregated ingredients
3. User checks off items as they shop
4. User taps "Share" to send list to messaging app

### Flow 4: Manage Recipes
1. User opens Recipe Library tab
2. User searches or filters by protein
3. User taps a recipe to view details
4. User marks as favourite/staple
5. User returns to library

---

## Color Choices

**Brand Colors (Singapore food/cooking theme):**
- **Primary:** `#E85D2A` (warm orange, inspired by sambal/spice)
- **Secondary:** `#2D5016` (deep green, fresh vegetables)
- **Accent:** `#F4D03F` (golden yellow, rice/noodles)

**Semantic Colors:**
- **Success:** `#27AE60` (green checkmark for bought items)
- **Warning:** `#F39C12` (orange for alerts)
- **Error:** `#E74C3C` (red for destructive actions)

**Neutral:**
- **Background:** `#FAFAF8` (off-white, warm tone)
- **Surface:** `#FFFFFF` (white for cards)
- **Text:** `#1A1A1A` (dark gray for readability)
- **Muted:** `#7F8C8D` (gray for secondary text)

---

## Navigation Structure

**Tab Bar (3 tabs):**
1. **Home** — Weekly planner (default)
2. **Recipes** — Recipe library
3. **Settings** — App preferences

**Modal Screens:**
- Weekly Generator (from Home)
- Day Detail (from Home)
- Recipe Detail (from Recipes)
- Grocery List (from Home or modal)

---

## Design Principles

- **One-handed usage:** All interactive elements within thumb reach
- **Portrait orientation:** 9:16 aspect ratio, single-column layout
- **Minimal, clean:** White space, clear typography, minimal decoration
- **Accessible:** High contrast, large touch targets (44pt minimum)
- **Fast feedback:** Haptic feedback on taps, loading states visible
