# MakanPlan Web Export Assessment — Research Notes

## Official deployment findings

- Expo’s `web.output: "static"` outputs a separate HTML file for every Expo Router route, which is suitable for static hosting.
- Expo documents `npx expo export -p web` as the static-export command and uses `dist` as the default output directory.
- Expo’s Vercel example uses a custom build command (`expo export -p web`), output directory (`dist`), `cleanUrls: true`, and a catch-all rewrite to `/`.
- Vercel serves only the configured output directory after the build. When the project is connected to Git, new commits trigger new deployments built from the latest repository commit.
- Vercel’s Hobby plan is free and intended for personal projects and small-scale applications; it is restricted to non-commercial, personal use.
- Expo describes AsyncStorage as persistent key-value storage. In this codebase, it provides separate local state on each app installation or browser storage partition; it does not create a shared recipe database.
- Expo’s DocumentPicker is usable with FileSystem after a selected file is copied to the cache directory. MakanPlan’s JSON import currently omits that explicit option, so it needs browser-specific validation or a small compatibility adjustment before it can be promised as a recovery path on the web.
- Expo ImagePicker supports web, but MakanPlan intentionally blocks photo selection when `Platform.OS === "web"`; local files are designed for native `documentDirectory` storage. Therefore, recipe photo attachment is currently unavailable in the web build despite package-level browser support.
- Expo Sharing on the web depends on the browser’s Web Share API, requires HTTPS, and cannot share local files by URI. MakanPlan’s existing JSON and ZIP backup exports write a local file and then share it, so they will not work in the web build as written.
- Expo Haptics uses the Web Vibration API in browsers. Feedback may work on supported hardware and browsers, but unsupported browsers may ignore it; this does not block the core planning workflow.
- Browser `localStorage` is origin-scoped and persists across normal browser sessions. Consequently, people using different browsers or devices have separate libraries; a consistent HTTPS production domain preserves that browser’s data through ordinary redeployments, while private browsing and cleared site data do not.

## Sources

1. Expo, “Publish websites” — https://docs.expo.dev/guides/publishing-websites/
2. Vercel, “Configuring a Build” — https://vercel.com/docs/builds/configure-a-build
3. Vercel, “Hobby Plan” — https://vercel.com/docs/plans/hobby
4. Expo, “AsyncStorage” — https://docs.expo.dev/versions/latest/sdk/async-storage/
5. Expo, “DocumentPicker” — https://docs.expo.dev/versions/latest/sdk/document-picker/
6. Expo, “ImagePicker” — https://docs.expo.dev/versions/latest/sdk/imagepicker/
7. Expo, “Sharing” — https://docs.expo.dev/versions/latest/sdk/sharing/
8. Expo, “Haptics” — https://docs.expo.dev/versions/latest/sdk/haptics/
9. MDN, “Window: localStorage property” — https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
