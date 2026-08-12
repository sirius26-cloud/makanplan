import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import { useState } from "react";

import {
  getGoogleDriveAuthConfig,
  getStoredGoogleDriveAccessToken,
  GOOGLE_DISCOVERY,
  storeGoogleDriveTokenResponse,
  uploadGoogleDriveRecipePhoto,
} from "@/lib/googleDrivePhotos";
import type { RecipePhoto } from "@/lib/types";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleDriveRecipePhoto() {
  const authConfig = getGoogleDriveAuthConfig();
  const [request, , promptAsync] = AuthSession.useAuthRequest(authConfig, GOOGLE_DISCOVERY);
  const [isUploading, setIsUploading] = useState(false);

  const uploadPhoto = async ({
    uri,
    mimeType,
    recipeName,
  }: {
    uri: string;
    mimeType?: string | null;
    recipeName: string;
  }): Promise<RecipePhoto> => {
    if (Platform.OS !== "ios") {
      throw new Error("Recipe photo uploads are available in the iOS app.");
    }
    if (!authConfig.clientId) {
      throw new Error("Google Drive is not configured for recipe photos.");
    }

    setIsUploading(true);
    try {
      let accessToken = await getStoredGoogleDriveAccessToken();
      if (!accessToken) {
        if (!request) throw new Error("Google Drive connection is preparing. Please try again.");
        const result = await promptAsync();
        if (result.type !== "success" || !result.params.code) {
          throw new Error("Google Drive connection was cancelled.");
        }
        const token = await AuthSession.exchangeCodeAsync(
          {
            clientId: authConfig.clientId,
            code: result.params.code,
            redirectUri: authConfig.redirectUri,
            extraParams: request.codeVerifier
              ? { code_verifier: request.codeVerifier }
              : undefined,
          },
          GOOGLE_DISCOVERY,
        );
        accessToken = await storeGoogleDriveTokenResponse(token);
      }

      return await uploadGoogleDriveRecipePhoto({
        uri,
        mimeType,
        recipeName,
        accessToken,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadPhoto, isUploading };
}
