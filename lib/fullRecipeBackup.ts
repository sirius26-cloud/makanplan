import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import JSZip from "jszip";
import { Platform } from "react-native";

import { importRecipesFromJSON } from "./recipeBackup";
import type { Recipe } from "./types";

const PHOTO_DIRECTORY = "recipe-photos";
const PHOTO_ARCHIVE_DIRECTORY = "photos";

export type ParsedFullBackup = {
  recipes: Recipe[];
  photoFiles: Map<string, string>;
};

function requireMobileStorage() {
  if (Platform.OS === "web" || !FileSystem.documentDirectory) {
    throw new Error("Full backups are available in the mobile app.");
  }
}

function extensionForMimeType(mimeType: string): string {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

function safeFilePart(value: string): string {
  return value.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-|-$/g, "") || "recipe";
}

function buildBackupEnvelope(recipes: Recipe[]) {
  return {
    version: "1.0",
    backupType: "full-recipes-and-photos",
    exportDate: new Date().toISOString(),
    recipeCount: recipes.length,
    recipes,
  };
}

export async function exportFullRecipeBackup(recipes: Recipe[]): Promise<void> {
  requireMobileStorage();
  const zip = new JSZip();
  const recipesForBackup: Recipe[] = [];
  let photoCount = 0;

  for (const recipe of recipes) {
    const photo = recipe.photo;
    if (!photo?.localUri) {
      recipesForBackup.push(recipe);
      continue;
    }

    const photoInfo = await FileSystem.getInfoAsync(photo.localUri);
    if (!photoInfo.exists) {
      recipesForBackup.push({ ...recipe, photo: undefined });
      continue;
    }

    const archivePath = `${PHOTO_ARCHIVE_DIRECTORY}/${safeFilePart(recipe.id)}.${extensionForMimeType(photo.mimeType)}`;
    const base64Photo = await FileSystem.readAsStringAsync(photo.localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    zip.file(archivePath, base64Photo, { base64: true });
    recipesForBackup.push({
      ...recipe,
      photo: { ...photo, localUri: archivePath },
    });
    photoCount += 1;
  }

  zip.file(
    "recipes.json",
    JSON.stringify({ ...buildBackupEnvelope(recipesForBackup), photoCount }, null, 2),
  );

  const zipBase64 = await zip.generateAsync({ type: "base64", compression: "DEFLATE" });
  const timestamp = new Date().toISOString().split("T")[0];
  const backupUri = `${FileSystem.documentDirectory}MakanPlan_Full_Backup_${timestamp}.zip`;
  await FileSystem.writeAsStringAsync(backupUri, zipBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Sharing is not available on this device.");
  }

  await Sharing.shareAsync(backupUri, {
    mimeType: "application/zip",
    dialogTitle: "Export MakanPlan Full Backup",
    UTI: "public.zip-archive",
  });
}

export async function parseFullRecipeBackup(zipBase64: string): Promise<ParsedFullBackup> {
  const zip = await JSZip.loadAsync(zipBase64, { base64: true });
  const recipesFile = zip.file("recipes.json");
  if (!recipesFile) throw new Error("Invalid backup: recipes.json is missing.");

  const recipes = await importRecipesFromJSON(await recipesFile.async("string"));
  const photoFiles = new Map<string, string>();
  const archivedPhotoPaths = Object.keys(zip.files).filter(
    (path) => path.startsWith(`${PHOTO_ARCHIVE_DIRECTORY}/`) && !zip.files[path].dir,
  );

  for (const path of archivedPhotoPaths) {
    photoFiles.set(path, await zip.files[path].async("base64"));
  }

  return { recipes, photoFiles };
}

export async function restoreFullBackupPhotos(
  recipes: Recipe[],
  photoFiles: Map<string, string>,
): Promise<Recipe[]> {
  requireMobileStorage();
  const photoDirectoryUri = `${FileSystem.documentDirectory}${PHOTO_DIRECTORY}/`;
  await FileSystem.makeDirectoryAsync(photoDirectoryUri, { intermediates: true });

  return Promise.all(
    recipes.map(async (recipe, index) => {
      const archivedPhotoPath = recipe.photo?.localUri;
      const base64Photo = archivedPhotoPath ? photoFiles.get(archivedPhotoPath) : undefined;
      if (!archivedPhotoPath || !base64Photo) {
        return { ...recipe, photo: undefined };
      }

      const mimeType = recipe.photo?.mimeType || "image/jpeg";
      const localUri = `${photoDirectoryUri}${safeFilePart(recipe.id)}-${Date.now()}-${index}.${extensionForMimeType(mimeType)}`;
      await FileSystem.writeAsStringAsync(localUri, base64Photo, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return {
        ...recipe,
        photo: { localUri, mimeType, savedAt: Date.now() },
      };
    }),
  );
}
