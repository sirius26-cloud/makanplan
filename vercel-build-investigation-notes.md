# Vercel Build Investigation Notes

## Initial evidence

- The attached Vercel report shows Metro failing to hash a dependency while bundling `node_modules/expo-router/node/render.js`. It does **not** show an app-source import or a route-casing error.
- The current `app.config.ts` already sets `web.output` to `"static"`; the report’s server-output hypothesis is therefore ruled out.
- `metro.config.js` uses Expo’s standard `getDefaultConfig(__dirname)` and NativeWind’s Metro wrapper. It has no custom `blockList`, watch-folder, or resolver exclusion.
- Expo’s Vercel-related issue [#35101](https://github.com/expo/expo/issues/35101) identifies an inappropriate custom Vercel install command (`npx expo install`) as a likely cause for a similar Expo web deployment problem, recommending a normal package-manager install instead. This needs confirmation against this project’s Vercel project settings and a clean dependency install.
- Expo’s API Routes documentation distinguishes server output from static output. MakanPlan uses static output and contains no web API-route requirement; static output remains the correct architecture for this deployment.
- Vercel documents that `installCommand` in repository `vercel.json` overrides the Install Command saved in Project Settings. This can enforce the package-manager installation required by the lockfile for every deployment.
- A local CI-style run of `CI=1 pnpm install --frozen-lockfile` followed by `CI=1 npx expo export -p web` completed successfully and emitted 17 static routes to `dist`. The app source, `web.output`, Metro block-list, and package lock are therefore not reproducing the failure; the remaining difference is Vercel’s installation/cache environment.
- The Vercel browser session is not authenticated, so the exact failing deployment’s dashboard-level install setting and cache state cannot be inspected directly from this workspace.
