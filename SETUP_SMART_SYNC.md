# MakanPlan: Smart Paste + Cloud Sync setup

What this adds
- Paste any recipe text -> Claude fills in every field -> one tap "Save to My Recipes Now" (or "Review & Edit").
- One master recipe library in Vercel Blob. Every device syncs to it, edits included.
- Settings -> Cloud Sync -> "Download Master Backup (JSON)" (same format as the existing backup).
- A safety copy of the master is saved daily in Blob under `backups/`.

Existing recipes are never removed by syncing. A recipe is only deleted if you delete it in the app.
Recipe photos stay on the device they were added on (they are not synced).

## Standard baseline (63 recipes)
The built-in starting library is now your master backup from 2026-10-08 (63 recipes, `lib/baselineRecipes.json`).
- New devices start with these 63.
- On the first ever sync, the baseline becomes the master. It replaces older never-edited copies on a device.
- Anything edited AFTER you install this update, and recipes that exist only on one device, are kept.
- If a device has its own older edit that differs from the baseline, that version is kept as "<name> (other device version)".
- BEFORE the first sync on each device: Settings -> Export All Recipes as JSON (a safety copy).
- To change the baseline later, replace `lib/baselineRecipes.json` with a newer export.

## Vercel setup (do this on the preview first)
1. Vercel -> project `makanplan` -> Storage tab -> Create -> Blob.
   Choose **Private** access. Connect it to the project. Tick **Preview** first (add Production when you launch).
   This adds `BLOB_READ_WRITE_TOKEN` automatically.
2. Project -> Settings -> Environment Variables. Add (Preview first, Production at launch):
   - `ANTHROPIC_API_KEY` = your key from console.anthropic.com
   - `MAKANPLAN_SYNC_KEY` = a passcode you invent (20+ characters). You will type this into the app.
   - Optional: `ANTHROPIC_MODEL` (default `claude-sonnet-5-5`)
3. Redeploy so the variables take effect.

## Using it
1. Open the app -> Settings -> Cloud Sync -> enter the passcode -> Save & Sync Now.
   (Phone app only: also enter your web address, e.g. https://makanplan.vercel.app)
2. Recipes -> Add -> Import -> Text tab -> paste -> Parse Recipe -> Save.
3. Repeat step 1 on each device with the same passcode.

## Notes
- If smart parsing is unavailable the app falls back to the old basic parser.
- Parsing costs a fraction of a cent per recipe.
- The old built-in 59 recipes are kept in `lib/legacySeedRecipes.ts` only so syncing can tell an untouched old copy from a real edit.
