export function buildGoogleDriveRedirectScheme(iOSClientId?: string): string {
  return iOSClientId
    ? `com.googleusercontent.apps.${iOSClientId.replace(".apps.googleusercontent.com", "")}`
    : "com.app.makanplan";
}

export function buildGoogleDriveRedirectUri(iOSClientId?: string): string {
  return `${buildGoogleDriveRedirectScheme(iOSClientId)}:/oauth2redirect`;
}
