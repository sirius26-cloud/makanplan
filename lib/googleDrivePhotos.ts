import * as AuthSession from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import type { RecipePhoto } from "./types";

const GOOGLE_DRIVE_TOKEN_KEY = "makanplan_google_drive_photo_session";
const GOOGLE_DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

export const GOOGLE_DISCOVERY = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
};

type GoogleDriveSession = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
};

let cachedSession: GoogleDriveSession | null | undefined;

export function getGoogleDriveClientId(): string {
  return Platform.OS === "ios"
    ? process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? ""
    : process.env.EXPO_PUBLIC_GOOGLE_DRIVE_CLIENT_ID ?? "";
}

export function getGoogleDriveRedirectScheme(): string {
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "";
  return clientId
    ? `com.googleusercontent.apps.${clientId.replace(".apps.googleusercontent.com", "")}`
    : "com.app.makanplan";
}

export function getGoogleDriveRedirectUri(): string {
  return AuthSession.makeRedirectUri({
    scheme: getGoogleDriveRedirectScheme(),
    path: "oauth2redirect",
  });
}

export function getGoogleDriveAuthConfig() {
  return {
    clientId: getGoogleDriveClientId(),
    redirectUri: getGoogleDriveRedirectUri(),
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
    scopes: [GOOGLE_DRIVE_SCOPE],
    extraParams: {
      access_type: "offline",
      prompt: "consent",
    },
  };
}

async function readSession(): Promise<GoogleDriveSession | null> {
  if (Platform.OS === "web") return null;
  if (cachedSession !== undefined) return cachedSession;

  const stored = await SecureStore.getItemAsync(GOOGLE_DRIVE_TOKEN_KEY);
  cachedSession = stored ? (JSON.parse(stored) as GoogleDriveSession) : null;
  return cachedSession;
}

export async function saveGoogleDriveSession(session: GoogleDriveSession): Promise<void> {
  if (Platform.OS === "web") return;
  cachedSession = session;
  await SecureStore.setItemAsync(GOOGLE_DRIVE_TOKEN_KEY, JSON.stringify(session));
}

function sessionFromTokenResponse(
  token: AuthSession.TokenResponse,
  existingRefreshToken?: string,
): GoogleDriveSession {
  return {
    accessToken: token.accessToken,
    refreshToken: token.refreshToken ?? existingRefreshToken,
    expiresAt: Date.now() + (token.expiresIn ?? 3600) * 1000,
  };
}

export async function getStoredGoogleDriveAccessToken(): Promise<string | null> {
  const session = await readSession();
  if (!session) return null;
  if (session.expiresAt > Date.now() + 60_000) return session.accessToken;
  if (!session.refreshToken || !getGoogleDriveClientId()) return null;

  try {
    const refreshed = await AuthSession.refreshAsync(
      {
        clientId: getGoogleDriveClientId(),
        refreshToken: session.refreshToken,
      },
      GOOGLE_DISCOVERY,
    );
    const refreshedSession = sessionFromTokenResponse(refreshed, session.refreshToken);
    await saveGoogleDriveSession(refreshedSession);
    return refreshedSession.accessToken;
  } catch {
    return null;
  }
}

export async function storeGoogleDriveTokenResponse(
  token: AuthSession.TokenResponse,
): Promise<string> {
  const existing = await readSession();
  const session = sessionFromTokenResponse(token, existing?.refreshToken);
  await saveGoogleDriveSession(session);
  return session.accessToken;
}

export function getGoogleDrivePhotoUri(driveFileId: string): string {
  return `https://www.googleapis.com/drive/v3/files/${driveFileId}?alt=media`;
}

export async function uploadGoogleDriveRecipePhoto({
  uri,
  mimeType,
  recipeName,
  accessToken,
}: {
  uri: string;
  mimeType?: string | null;
  recipeName: string;
  accessToken: string;
}): Promise<RecipePhoto> {
  const sourceResponse = await fetch(uri);
  if (!sourceResponse.ok) {
    throw new Error("Unable to read the selected recipe photo.");
  }

  const resolvedMimeType = mimeType || sourceResponse.headers.get("content-type") || "image/jpeg";
  const fileBlob = await sourceResponse.blob();
  const uploadResponse = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=media",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": resolvedMimeType,
      },
      body: fileBlob,
    },
  );

  if (!uploadResponse.ok) {
    throw new Error("Google Drive could not upload the recipe photo.");
  }

  const uploaded = (await uploadResponse.json()) as { id?: string };
  if (!uploaded.id) throw new Error("Google Drive did not return a photo file ID.");

  const safeName = recipeName.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "recipe";
  const extension = resolvedMimeType === "image/png" ? "png" : "jpg";
  const metadataResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files/${uploaded.id}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: `MakanPlan-${safeName}-${Date.now()}.${extension}` }),
    },
  );

  if (!metadataResponse.ok) {
    throw new Error("Google Drive uploaded the photo but could not name it.");
  }

  return {
    driveFileId: uploaded.id,
    mimeType: resolvedMimeType,
    uploadedAt: Date.now(),
  };
}
