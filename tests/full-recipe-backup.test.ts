import { beforeEach, describe, expect, it, vi } from "vitest";
import JSZip from "jszip";

const fsMocks = vi.hoisted(() => ({
  getInfoAsync: vi.fn(),
  readAsStringAsync: vi.fn(),
  writeAsStringAsync: vi.fn(),
  makeDirectoryAsync: vi.fn(),
}));

const sharingMocks = vi.hoisted(() => ({
  isAvailableAsync: vi.fn(),
  shareAsync: vi.fn(),
}));

vi.mock("expo-file-system/legacy", () => ({
  documentDirectory: "file://documents/",
  EncodingType: { Base64: "base64" },
  getInfoAsync: fsMocks.getInfoAsync,
  readAsStringAsync: fsMocks.readAsStringAsync,
  writeAsStringAsync: fsMocks.writeAsStringAsync,
  makeDirectoryAsync: fsMocks.makeDirectoryAsync,
}));

vi.mock("expo-sharing", () => ({
  isAvailableAsync: sharingMocks.isAvailableAsync,
  shareAsync: sharingMocks.shareAsync,
}));

vi.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

import {
  exportFullRecipeBackup,
  parseFullRecipeBackup,
  restoreFullBackupPhotos,
} from "../lib/fullRecipeBackup";
import type { Recipe } from "../lib/types";

const recipe: Recipe = {
  id: "chicken-broccoli",
  name: "Chicken with Broccoli",
  type: "protein_main",
  protein: "chicken",
  hasVeg: true,
  isRice: false,
  isFavourite: false,
  isStaple: false,
  ingredients: ["chicken", "broccoli"],
  instructions: "Cook.",
  servings: 4,
  cuisineType: "Cantonese",
  spiceLevel: "light",
  createdAt: 1,
  photo: {
    localUri: "file://documents/recipe-photos/chicken.jpg",
    mimeType: "image/jpeg",
    savedAt: 2,
  },
};

describe("full recipe backup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fsMocks.getInfoAsync.mockResolvedValue({ exists: true });
    fsMocks.readAsStringAsync.mockResolvedValue("cGhvdG8tYnl0ZXM=");
    sharingMocks.isAvailableAsync.mockResolvedValue(true);
  });

  it("archives recipes.json and the local photo file in a ZIP", async () => {
    await exportFullRecipeBackup([recipe]);

    const [, exportedZipBase64] = fsMocks.writeAsStringAsync.mock.calls[0];
    const zip = await JSZip.loadAsync(exportedZipBase64, { base64: true });
    const manifest = JSON.parse(await zip.file("recipes.json")!.async("string"));

    expect(manifest.recipes).toHaveLength(1);
    expect(manifest.recipes[0].photo.localUri).toBe("photos/chicken-broccoli.jpg");
    expect(await zip.file("photos/chicken-broccoli.jpg")!.async("base64")).toBe("cGhvdG8tYnl0ZXM=");
    expect(sharingMocks.shareAsync).toHaveBeenCalledOnce();
  });

  it("restores archived photo bytes to new local file paths", async () => {
    const zip = new JSZip();
    zip.file("recipes.json", JSON.stringify({ recipes: [{ ...recipe, photo: { ...recipe.photo!, localUri: "photos/chicken-broccoli.jpg" } }] }));
    zip.file("photos/chicken-broccoli.jpg", "cGhvdG8tYnl0ZXM=", { base64: true });
    const zipBase64 = await zip.generateAsync({ type: "base64" });

    const parsed = await parseFullRecipeBackup(zipBase64);
    const restored = await restoreFullBackupPhotos(parsed.recipes, parsed.photoFiles);

    expect(fsMocks.makeDirectoryAsync).toHaveBeenCalledWith("file://documents/recipe-photos/", {
      intermediates: true,
    });
    expect(restored[0].photo?.localUri).toMatch(/^file:\/\/documents\/recipe-photos\/chicken-broccoli-/);
    expect(fsMocks.writeAsStringAsync).toHaveBeenCalledWith(
      restored[0].photo?.localUri,
      "cGhvdG8tYnl0ZXM=",
      { encoding: "base64" },
    );
  });
});
