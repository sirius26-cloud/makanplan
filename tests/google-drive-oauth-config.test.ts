import { describe, expect, it } from "vitest";

describe("Google Drive photo configuration", () => {
  it("has valid Google OAuth client IDs and reaches Google's OpenID configuration", async () => {
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_DRIVE_CLIENT_ID;
    const iOSClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

    expect(webClientId).toMatch(/^[0-9]+-[a-z0-9-]+\.apps\.googleusercontent\.com$/);
    expect(iOSClientId).toMatch(/^[0-9]+-[a-z0-9-]+\.apps\.googleusercontent\.com$/);

    const response = await fetch(
      "https://accounts.google.com/.well-known/openid-configuration",
    );

    expect(response.ok).toBe(true);
    const configuration = (await response.json()) as {
      authorization_endpoint?: string;
      token_endpoint?: string;
    };
    expect(configuration.authorization_endpoint).toBe(
      "https://accounts.google.com/o/oauth2/v2/auth",
    );
    expect(configuration.token_endpoint).toBe("https://oauth2.googleapis.com/token");
  });
});
