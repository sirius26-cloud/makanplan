# MakanPlan: Static Web Export and Vercel Assessment

**Assessment date:** 13 August 2026  
**Scope:** Current MakanPlan codebase, without redesigning its mobile-first storage or backup features.

## Executive conclusion

> **MakanPlan can be exported as a static website and hosted on Vercel’s Hobby plan for personal, non-commercial sharing with friends.** The project already uses Expo Router’s `web.output: "static"` setting, which creates standalone HTML files for its routes and is intended for static hosting. [1]

I successfully completed a production web export of the current project with `npx expo export --platform web --output-dir web-dist`. It generated **17 static routes**, a **3.7 MB** output directory, and a **2.7 MB** main web JavaScript bundle. The full automated test suite passed (**7 tests passed, 1 intentionally skipped**), and TypeScript passed with **zero errors**.

This makes the project **viable as a browser-accessible meal-planning companion**. It is **not yet a feature-for-feature browser replacement for the native app**, because its current photo and file-based backup implementation deliberately depends on native on-device storage. I recommend a small, tightly scoped web-compatibility update before relying on the web version as your personal day-to-day primary copy.

## 1. Does the current codebase build cleanly for web?

**Yes.** The Expo web export completed successfully after I removed one obsolete, unused Google Drive helper file that had been reintroduced by the checkpoint recovery. That file still referenced the removed OAuth package and an old photo-field shape, producing two unrelated TypeScript errors. Its removal does not restore or change Google Drive functionality; MakanPlan remains on the agreed **local on-device photo** approach.

| Validation | Result | Evidence |
|---|---:|---|
| Production web export | **Passed** | `npx expo export --platform web --output-dir web-dist` completed successfully |
| Static routes | **17** | Includes the main planner, recipes, settings, grocery list, generator, and detail routes |
| Exported output | **3.7 MB** | Static HTML, assets, CSS, and JavaScript bundle |
| TypeScript | **Passed** | `pnpm check` completed with zero errors |
| Test suite | **Passed** | 7 tests passed; the unrelated authentication test remains intentionally skipped |
| Curated default library | **Confirmed** | Dedicated test verifies exactly 44 uniquely identified recipes |

Expo documents `npx expo export -p web` as the normal static-web export command, with the default production output in `dist`. Your existing `web.output: "static"` configuration is the correct target for this use case. [1]

## 2. What changes in a browser?

The meal generator, recipe library, grocery-list calculation, dietary filtering, serving scaling, and ordinary recipe editing are client-side logic and are suitable for the static web build. However, browser security and storage rules change the implementation details of several device-oriented features.

| Feature | Current web status | What this means in practice |
|---|---|---|
| Recipe library, generator, grocery calculations, settings | **Works in the exported bundle** | These features use local state and normal React/Expo Web rendering. |
| Recipe, plan, and settings persistence | **Per browser, per origin** | The web copy has its own browser storage. It is not connected to the native app or to other visitors. [9] |
| Recipe photos | **Unavailable by design** | The current photo-picker explicitly displays a “mobile feature” message on web. Local native photo files cannot be carried into browser storage as written. |
| Camera/photo library | **Unavailable in MakanPlan as written** | Expo ImagePicker itself supports web, but MakanPlan intentionally blocks it because photos are copied into the native document directory. [6] |
| Recipe-only JSON export | **Not web-compatible as written** | The current export writes a native local file and invokes a native-style share flow. Browser file sharing by local URI is not supported. [7] |
| Recipe-only JSON import | **Needs a small compatibility patch before it can be promised** | Expo DocumentPicker supports file selection, but this path currently relies on native file reading and has no browser-specific file/Blob reader or end-to-end browser validation. [5] |
| Full Backup ZIP export and restore | **Unavailable on web by design** | The code detects web and reports that full backups are mobile-only. ZIP parsing uses pure JavaScript, but the current photo file save/restore layer is native-only. |
| Grocery list email | **Likely available through `mailto:`** | The app’s email action opens a mail link in the browser. The installed browser/email client determines the experience. |
| Grocery “Share” / Notes flow | **Browser-dependent** | Web sharing requires HTTPS and a browser that implements the Web Share API. It cannot share local backup files by URI. [7] |
| Haptic feedback | **Best effort only** | Expo maps it to the Web Vibration API. Unsupported browsers may silently ignore it, without blocking normal use. [8] |

The key correction to the original assumption is that **photo picking is not merely a different browser file dialog in the current code**. It is intentionally disabled, because the selected file would need a browser-appropriate persistence mechanism rather than the app’s native `documentDirectory` folder. Likewise, **the existing JSON and ZIP export controls should not be relied upon in the web build** until they use browser downloads instead of native file sharing.

## 3. The earlier Google Drive web OAuth client

It is **not needed and is not currently used**. Google Drive/OAuth photo storage was fully removed when the app moved to local on-device photos. There is no current Google authorization flow, Drive upload, Drive download, or web OAuth redirect handling in MakanPlan.

Your previously created **Web application** OAuth client therefore requires no adjustment for this web deployment. It can remain unused or be removed from Google Cloud if you no longer need it for another project. A future decision to introduce cloud photo storage would be a separate feature with its own privacy, persistence, and web OAuth design—not a prerequisite for hosting the current static site.

## 4. Cost, rebuilds, and Vercel’s free tier

Vercel’s **Hobby** plan is free for personal, non-commercial projects and small-scale applications, which matches a private meal planner shared with friends. [3] Vercel serves the configured static output directory and, after a Git repository is connected, builds fresh deployments from new commits. [2]

Therefore, your assumption about the normal workflow is correct: after the repository is connected, a push to the production branch can automatically trigger a fresh Vercel build. You would not need a person to manually run a web export for every ordinary code update. Preview deployments may also be created for branch or pull-request changes, depending on your Vercel project settings.

I cannot verify, estimate, or make commitments about **Manus credits or billing**. For an authoritative answer on whether a web-export workflow affects your Manus plan or credits, please submit that question through [Manus Help](https://help.manus.im).

## 5. Your own 44 recipes in the web version

The native application’s `AsyncStorage` and the website’s browser storage are **different storage locations**. Opening the website for the first time does not read recipes from your phone, and opening it does not alter the recipes on your phone.

On a brand-new browser profile, MakanPlan will see an empty library and seed exactly the bundled **44 curated recipes**. I confirmed that the master seed test passes with exactly 44 unique recipes. The seeding logic only runs when the stored recipe array is empty; it does not replace a non-empty web library on ordinary Vercel redeployments at the same URL.

| Situation | What you will see |
|---|---|
| First visit to the production website | The bundled 44 curated recipes, plus the default settings. |
| Existing native app on your phone | Your current native data remains independent and unchanged. |
| Later visit on the same normal browser and same HTTPS domain | That browser’s saved web library, plan, and settings are loaded rather than reseeded. |
| Private/incognito browsing, cleared site data, or a different browser/device | A fresh web library, seeded from the bundled 44 recipes. [9] |
| Custom recipe changes made only in the native app | They do **not** appear on the website automatically. A cross-device sync service would be required for that. |

Your existing mobile JSON backup remains a sensible precaution. However, because the current web import path has not been made browser-specific or browser-tested, I cannot responsibly guarantee that it will restore custom data in the web build **as it is today**. Before treating the web version as your primary personal copy, the recommended compatibility update should implement a browser JSON reader and a browser JSON download flow, then test an import of your actual backup.

## 6. What friends see and whether data is shared

Your understanding is correct. Friends do **not** receive a shared live copy of your recipes, and their edits cannot overwrite yours. MakanPlan has no connected user account, database, API synchronization, or server-side recipe storage. The static site delivers the same bundled application code to everyone, and each visitor’s browser creates its own local recipe, plan, and settings data.

Browser local storage is scoped to the site’s **origin** and normally persists across browser sessions. [9] That has two useful implications:

| Deployment choice | Storage result |
|---|---|
| Your stable Vercel production URL or custom domain | Each visitor keeps their own data across normal redeployments at that same URL. |
| Different visitor/device/browser profile | Separate storage; no shared recipes or plans. |
| Vercel preview URL | Separate origin, therefore separate test data from production. |
| Cleared browser site data or private browsing | Existing data is removed or temporary; the 44-recipes seed appears again. |

This also makes the seed-data privacy point especially important. **Every seed recipe is included in the public static bundle and is visible to any visitor.** Personal edits entered in your own browser are not uploaded or exposed, but anything hardcoded as a seed should be content you are comfortable sharing publicly.

## Recommended path

I recommend treating the current web build as **viable, but feature-reduced**. It is ready to be hosted if your goal is to let friends browse the 44 seed recipes and use independent, local meal plans. Before using it as the everyday replacement for your native MakanPlan installation, make one small compatibility pass that keeps the existing mobile behavior intact while adding browser-specific handling for:

1. **JSON export:** generate a browser `Blob` and trigger a download instead of writing to `documentDirectory` and sharing a file URI.
2. **JSON import:** read the selected browser `File`/`Blob` directly, then retain the existing Replace All and Add to Library choices.
3. **Photo controls:** either keep the current clear “mobile only” message, or separately add browser-local image storage. The latter is possible but should be treated as a new feature, not implied by static hosting.
4. **Full ZIP backup:** keep it mobile-only initially, or build a distinct browser download/upload implementation if ZIP recovery is required on the web.

## Vercel deployment steps

After the recommended web backup/import compatibility patch—or now, if you are comfortable with the feature limitations—use the following workflow.

1. **Keep a mobile backup first.** Export your current recipe JSON and, if photos matter, a mobile Full Backup ZIP. The website does not migrate data from the native app automatically.

2. **Push the MakanPlan repository to GitHub.** Use the repository containing `app.config.ts`, `package.json`, and the Expo Router source.

3. **Add the Vercel configuration at the repository root** before pushing. Expo’s own Vercel guidance uses the following configuration for a static Expo Router export. [1]

   ```json
   {
     "buildCommand": "npx expo export -p web",
     "outputDirectory": "dist",
     "devCommand": "expo",
     "cleanUrls": true,
     "framework": null,
     "rewrites": [
       {
         "source": "/:path*",
         "destination": "/"
       }
     ]
   }
   ```

   This explicit build command is important because the repository’s generic `build` script is for the existing Node server, whereas Vercel should run the Expo **web export** for this static site.

4. **In Vercel, select “Add New → Project” and import the GitHub repository.** Set the framework preset to **Other** if Vercel does not detect the project correctly. Confirm that the build command is `npx expo export -p web` and the output directory is `dist`. Vercel only serves the configured output directory. [2]

5. **Deploy and use the production URL as the stable address.** A custom domain is optional. Keep using the same HTTPS production hostname if you want each person’s browser storage to survive ordinary site updates.

6. **Test the public production URL on Safari (iPhone), Chrome desktop, and one fresh browser profile.** Verify the seed recipe count is 44, generate a meal plan, change a setting, reload, and confirm the browser retains its own changes. Do not use a Vercel preview URL as a persistence test because it has a different origin and separate storage.

7. **For future updates, push to the production branch.** Vercel builds a new deployment from the latest Git commits; visitors keep their browser-local data as long as they continue opening the same production origin. [2]

## Bottom line

**Yes—Vercel static hosting is technically viable and appropriate for sharing MakanPlan with friends, provided it remains a personal, non-commercial project.** The current application builds cleanly and the core planning experience is suitable for web. Friends will each receive the public 44-recipe seed library and a separate local copy of their plans and settings.

The important limitation is not the static build itself. It is that the current **local-photo and native-file backup design is intentionally mobile-specific**. Keep the native app as your fully featured personal copy for now, or approve the narrow browser backup/import compatibility update before treating the hosted website as its equivalent replacement.

## References

[1]: https://docs.expo.dev/guides/publishing-websites/ "Expo — Publish websites"
[2]: https://vercel.com/docs/builds/configure-a-build "Vercel — Configuring a Build"
[3]: https://vercel.com/docs/plans/hobby "Vercel — Hobby Plan"
[4]: https://docs.expo.dev/versions/latest/sdk/async-storage/ "Expo — AsyncStorage"
[5]: https://docs.expo.dev/versions/latest/sdk/document-picker/ "Expo — DocumentPicker"
[6]: https://docs.expo.dev/versions/latest/sdk/imagepicker/ "Expo — ImagePicker"
[7]: https://docs.expo.dev/versions/latest/sdk/sharing/ "Expo — Sharing"
[8]: https://docs.expo.dev/versions/latest/sdk/haptics/ "Expo — Haptics"
[9]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage "MDN — Window: localStorage property"
