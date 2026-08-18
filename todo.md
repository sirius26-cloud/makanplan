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

## Phase 13: Recipe Data Persistence Fix
- [x] Diagnose root cause of recipe reset on publish
- [x] Create userRecipes.ts with 44 curated recipes
- [x] Update RecipeContext to use user recipes as defaults
- [x] Fix seeding logic to preserve data on future publishes
- [x] Add Taiwanese cuisine type support
- [x] Verify TypeScript compilation

## Phase 14: Final Testing & Delivery
- [ ] Test all user flows end-to-end
- [ ] Verify JSON import works with real files
- [ ] Test meal history tracking
- [ ] Test dietary filters
- [ ] Test recipe persistence on publish
- [ ] Create final checkpoint
- [ ] Deliver app to user


## Phase 15: Scoped Recipe Photos, One-Pot Fix, and 44-Recipe Master Seed
- [x] Confirm photo storage approach and persistence expectations with user
- [x] Inspect and configure the required Google Drive integration
- [x] Add optional one-photo-per-recipe field and Google Drive upload flow
- [x] Show recipe photos on recipe cards and recipe detail; support replace/remove
- [x] Bundle the attached 44-recipe JSON as the master initial recipe list
- [x] Fix weekly generation so each day independently chooses one-pot or main+veg
- [x] Fix normal single-day reshuffle so it can choose either format
- [x] Run targeted tests and verify no unrelated behavior changed
- [ ] Save checkpoint with only scoped changes

> Scope note: Do not refactor or modify unrelated features, navigation, storage behavior, or styling beyond what is necessary for these requested changes.

## Phase 16: Scoped Typography and Existing-Recipe Photo Import
- [x] Inspect current font sizing and existing-recipe photo access points
- [x] Increase font sizes modestly without changing layouts or unrelated styling
- [x] Add a direct photo import action for existing recipes using the current Google Drive photo workflow
- [x] Run targeted checks and verify no unrelated behavior changed
- [x] Save checkpoint with only scoped changes

> Scope note: Do not change any feature behavior other than font sizing and existing-recipe photo import access.

## Phase 17: Scoped Stable Google OAuth Redirect
- [x] Inspect the current Google Drive redirect URI generation
- [x] Force the iOS OAuth flow to use the stable client-scheme redirect URI
- [x] Validate configuration and document the exact Google Cloud registration value
- [x] Save checkpoint with only the OAuth redirect fix

> Scope note: Do not modify recipe, photo, navigation, or typography behavior beyond the redirect URI fix.

## Phase 18: Scoped Local Device Recipe Photo Storage
- [x] Inspect the current Google Drive photo layer and local file persistence requirements
- [x] Replace Google Drive photo metadata and upload logic with local device file references
- [x] Keep existing recipe photo add, replace, remove, card, and detail controls unchanged
- [x] Remove Google OAuth requirements that are no longer needed for local photos
- [x] Run targeted checks and verify no unrelated behavior changed
- [x] Save checkpoint with only the local photo storage change

> Scope note: Do not change meal planning, recipe management, navigation, typography, or other behavior beyond the photo storage backend.

## Phase 19: Scoped ZIP Full Backup (Recipes + Photos)
- [x] Inspect ZIP library options and current Settings backup section
- [x] Implement ZIP export: bundle recipes.json and photos folder, share via system sheet
- [x] Implement ZIP import: extract recipes.json and restore photo files, merge or replace
- [x] Add Full Backup and Restore buttons to Settings without touching the existing JSON section
- [x] Run targeted tests and verify no unrelated behavior changed
- [ ] Save checkpoint with only the scoped ZIP backup change

> Scope note: Do not modify the existing recipe-only JSON export/import or any other feature.

## Phase 20: Web Export and Vercel Viability Assessment
- [x] Remove obsolete Google Drive photo helper that causes unrelated TypeScript errors
- [x] Inspect web configuration and dependencies for compatibility risks
- [x] Run a production Expo web export and assess its output
- [x] Verify browser storage, photo, full backup, OAuth, and seed-data behavior on web
- [x] Research Vercel deployment requirements and future update workflow
- [x] Deliver the web export and Vercel assessment without changing app functionality

## Phase 21: Vercel Deployment Configuration
- [x] Add `vercel.json` for the Expo static web export
- [x] Validate the Vercel configuration and output command
- [x] Save a deployment-ready checkpoint and report the settings

## Phase 22: GitHub Deployment Readiness Verification
- [x] Inspect local changes and GitHub branch tracking status
- [x] Confirm GitHub contains `vercel.json` and the latest web-export configuration
- [x] Report synchronization status for Vercel deployment

## Phase 23: Push Vercel Checkpoint to GitHub
- [x] Inspect local and GitHub branch divergence
- [x] Push the pending Vercel checkpoint to GitHub
- [x] Verify the remote commit and report synchronization

## Phase 24: Vercel Static-Export Build Failure
- [x] Reproduce the Vercel-equivalent clean dependency installation and isolate the environment difference
- [x] Identify the Vercel dependency-install/cache path as the remaining failure surface; static output and app source are not implicated
- [x] Apply the smallest static-export configuration fix
- [x] Verify the clean production export, TypeScript, and tests
- [x] Push the fix to GitHub and document the root cause

## Phase 25: Responsive Web Styling Fix
- [x] Inspect exported CSS assets and the affected web-only control styling
- [x] Restore the correct CSS pipeline for Vercel static output
- [x] Add scoped responsive type scaling for desktop and mobile web viewports
- [x] Validate the production export at desktop and mobile dimensions
- [x] Push the styling fix to GitHub and report the deployment steps

## Phase 26: Mobile Portrait Scroll and Bottom Tabs
- [x] Inspect portrait scroll containment and bottom-tab styling
- [x] Restore mobile web scrolling and protect content from tab-bar overlap
- [x] Standardize Home, Recipes, and Settings tab icons and labels
- [x] Validate generated-plan scrolling in portrait and landscape phone viewports
- [x] Push the verified mobile web fix to GitHub and report deployment steps

## Phase 27: Screen-Specific Mobile Portrait Scroll Fix
- [x] Inspect weekly-plan and recipe-library scroll ownership at phone width
- [x] Apply the smallest mobile web scroll fixes to the two affected screens
- [x] Validate both screens at phone portrait width and production export
- [x] Push the verified fix to GitHub and report the result

## Phase 30: Secondary Toggle Contrast Restoration
- [x] Reapply the missing `secondary` theme token and declaration only
- [x] Verify the day-format toggle renders with a dark-green background and white text
- [x] Save, push, and report the exact Vercel commit hash
