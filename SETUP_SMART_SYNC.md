# MakanPlan: Smart Paste + Cloud Sync setup

What this adds
- Paste any recipe text -> Claude fills in every field -> one tap "Save to My Recipes Now" (or "Review & Edit").
- One master recipe library in Vercel Blob. Every device syncs to it, edits included.
- Settings -> Cloud Sync -> "Download Master Backup (JSON)" (same format as the existing backup).
- A safety copy of the master is saved daily in Blob under `backups/`.

Existing recipes are never removed by syncing. A recipe is only deleted if you delete it in the app.
Recipe photos stay on the device they were added on (they are not synced).

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
- `tests/master-recipes.test.ts` already failed before this change (it expects 44 seed recipes; the app now has 59).
