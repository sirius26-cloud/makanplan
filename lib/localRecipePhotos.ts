import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

import type { RecipePhoto } from "./types";

const PHOTO_DIRECTORY_NAME = "recipe-photos";

function getExtension(mimeType?: string | null): string {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

function getPhotoDirectoryUri(): string {
  if (!FileSystem.documentDirectory) {
    throw new Error("Local photo storage is unavailable on this device.");
  }
  return `${FileSystem.documentDirectory}${PHOTO_DIRECTORY_NAME}/`;
}

export async function saveLocalRecipePhoto({
  uri,
  mimeType,
  recipeName,
}: {
  uri: string;
  mimeType?: string | null;
  recipeName: string;
}): Promise<RecipePhoto> {
  if (Platform.OS === "web") {
    throw new Error("Local recipe photos are available in the mobile app.");
  }

  const directoryUri = getPhotoDirectoryUri();
  await FileSystem.makeDirectoryAsync(directoryUri, { intermediates: true });
  const safeName = recipeName.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "recipe";
  const resolvedMimeType = mimeType || "image/jpeg";
  const localUri = `${directoryUri}${safeName}-${Date.now()}.${getExtension(resolvedMimeType)}`;

  await FileSystem.copyAsync({ from: uri, to: localUri });
  return { localUri, mimeType: resolvedMimeType, savedAt: Date.now() };
}

export async function deleteLocalRecipePhoto(photo?: RecipePhoto): Promise<void> {
  if (!photo?.localUri || Platform.OS === "web") return;
  const file = await FileSystem.getInfoAsync(photo.localUri);
  if (file.exists) {
    await FileSystem.deleteAsync(photo.localUri, { idempotent: true });
  }
}
