# MakanPlan TODO

## Phase 1: Recipe Library & Data Model
- [x] Create Recipe type and AsyncStorage persistence layer
- [x] Seed initial recipe data (10–15 recipes covering proteins, veg sides, rice/noodle one-pots)
- [x] Build recipe library screen with search and filter UI
- [x] Build recipe detail screen with favourite/staple toggle
- [x] Implement recipe CRUD operations (add, edit, delete)

## Phase 2: Weekly Meal Generator
- [x] Create generator logic (select main, pair with veg side, rotate veg pool)
- [x] Build weekly generator config screen (people count, days, protein filter, rice days)
- [x] Implement meal plan storage and retrieval
- [x] Build home/weekly planner screen showing generated week
- [x] Add per-day shuffle/reshuffle functionality

## Phase 3: Grocery List
- [x] Build ingredient aggregation logic (dedupe, normalize names, skip pantry staples)
- [x] Create grocery list screen with grouped display (Protein/Veg/Pantry/Other)
- [x] Add checkbox functionality for marking items as bought
- [x] Implement share functionality (system share sheet)
- [x] Add pantry staples management in settings

## Phase 4: Navigation & Settings
- [x] Set up tab bar navigation (Home, Recipes, Settings)
- [x] Build settings screen (default servings, pantry staples)
- [x] Add modals for day detail, weekly generator, grocery list
- [x] Implement proper back/dismiss navigation

## Phase 5: Branding & Polish
- [x] Generate custom app logo
- [x] Update theme colors (primary: #E85D2A, secondary: #2D5016, accent: #F4D03F)
- [x] Update app.config.ts with branding info
- [x] Add haptic feedback to key interactions
- [ ] Test all user flows end-to-end

## Phase 6: Final Testing & Delivery
- [ ] Verify all buttons and flows work
- [ ] Test on iOS and web preview
- [ ] Create checkpoint
- [ ] Deliver to user


## Phase 7: Family Favourites & Enhancements
- [x] Add family favourite recipes (Chicken with Broccoli, Three-Cup Chicken, Salmon One-Pot Rice)
- [x] Implement similar dish suggestions based on cuisine/protein
- [x] Improve UI typography (larger fonts, better hierarchy)
- [x] Add coloured category boxes for recipe types
- [x] Add recipe scaling feature (adjust ingredients by pax)
- [x] Implement dish rotation/swap functionality
- [x] Create local setup guide and deployment instructions


## Phase 8: Grocery List Export Feature
- [x] Create export utility to format grocery list as text
- [x] Implement system share sheet for Notes/email/messaging
- [x] Add export buttons to grocery list screen
- [x] Test export on iOS and Android
- [x] Create checkpoint and deliver


## Phase 9: Bug Fixes
- [x] Fix rotation backend error (investigate meal generator)
- [x] Fix missing ingredient portions in recipe scaling display
- [x] Replace 'Mixed' protein with multiple protein selection UI
- [x] Test all fixes and create checkpoint


## Phase 10: JSON Backup & Import
- [x] Implement JSON export for all recipes with metadata
- [x] Implement JSON import with deduplication logic
- [x] Add replace vs. merge dialog for imports
- [x] Fix DocumentPicker result handling for current expo-document-picker API
- [x] Test JSON import/export workflow end-to-end

## Phase 11: Meal History & Dietary Filters
- [x] Implement meal history tracker to avoid suggesting same meals too frequently
- [x] Add persistent dietary restriction filters (no pork, no shellfish, etc.)
- [x] Display dietary restrictions in Settings
- [x] Filter meal generator results based on dietary restrictions
- [x] Test meal history and filters

## Phase 12: Meal Prep Timeline
- [ ] Design meal prep timeline UI (show prep-ahead steps)
- [ ] Break recipes into prep steps with timing
- [ ] Add timeline view to day detail screen
- [ ] Allow users to mark prep steps as complete
- [ ] Test timeline feature

## Phase 13: Final Testing & Delivery
- [ ] Test all user flows end-to-end
- [ ] Verify JSON import works with real files
- [ ] Test meal history tracking
- [ ] Test dietary filters
- [ ] Create final checkpoint
- [ ] Deliver app to user
