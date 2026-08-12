import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";

import { getGoogleDrivePhotoUri, getStoredGoogleDriveAccessToken } from "@/lib/googleDrivePhotos";
import type { RecipePhoto } from "@/lib/types";

type RecipePhotoProps = {
  photo?: RecipePhoto;
  variant: "thumbnail" | "detail" | "editor";
};

export function RecipePhotoView({ photo, variant }: RecipePhotoProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!photo) {
      setAccessToken(null);
      return;
    }
    getStoredGoogleDriveAccessToken().then((token) => {
      if (isMounted) setAccessToken(token);
    });
    return () => {
      isMounted = false;
    };
  }, [photo?.driveFileId]);

  if (!photo) return null;

  const style = variant === "thumbnail" ? styles.thumbnail : variant === "detail" ? styles.detail : styles.editor;
  if (!accessToken) {
    return (
      <View style={[style, styles.unavailable]}>
        <Text style={styles.unavailableText}>Recipe photo</Text>
      </View>
    );
  }

  return (
    <Image
      source={{
        uri: getGoogleDrivePhotoUri(photo.driveFileId),
        headers: { Authorization: `Bearer ${accessToken}` },
      }}
      contentFit="cover"
      style={style}
      transition={150}
    />
  );
}

const styles = StyleSheet.create({
  thumbnail: { width: 68, height: 68, borderRadius: 10 },
  detail: { width: "100%", height: 240, borderRadius: 12 },
  editor: { width: "100%", height: 180, borderRadius: 12 },
  unavailable: { backgroundColor: "#F1F3F5", alignItems: "center", justifyContent: "center" },
  unavailableText: { color: "#687076", fontSize: 13, fontWeight: "600" },
});
