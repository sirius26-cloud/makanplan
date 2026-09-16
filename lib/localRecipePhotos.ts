import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

import type { RecipePhoto } from "./types";

const PHOTO_DIRECTORY_NAME = "recipe-photos";

// Web has no native file system — recipe photos are stored as a compressed
// base64 data URL directly on the recipe itself (photo.localUri). This needs
// no separate storage layer: RecipePhotoView already just renders whatever
// URI it's given, and a data URL renders exactly like a file:// URI would.
// Capped at 1024px / JPEG q0.7 so a photo stays reasonably small next to the
// rest of the recipe library in browser storage.
const WEB_MAX_DIMENSION = 1024;
const WEB_JPEG_QUALITY = 0.7;

async function compressImageForWeb(uri: string): Promise<{ dataUrl: string; mimeType: string }> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);

  let { width, height } = bitmap;
  if (width > WEB_MAX_DIMENSION || height > WEB_MAX_DIMENSION) {
    const scale = WEB_MAX_DIMENSION / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not process this image on your browser.");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);

  const dataUrl = canvas.toDataURL("image/jpeg", WEB_JPEG_QUALITY);
  return { dataUrl, mimeType: "image/jpeg" };
}

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
    const { dataUrl, mimeType: resolvedMimeType } = await compressImageForWeb(uri);
    return { localUri: dataUrl, mimeType: resolvedMimeType, savedAt: Date.now() };
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
