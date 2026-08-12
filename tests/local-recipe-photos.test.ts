import { beforeEach, describe, expect, it, vi } from "vitest";

const fsMocks = vi.hoisted(() => ({
  makeDirectoryAsync: vi.fn(),
  copyAsync: vi.fn(),
  getInfoAsync: vi.fn(),
  deleteAsync: vi.fn(),
}));

vi.mock("expo-file-system/legacy", () => ({
  documentDirectory: "file://documents/",
  makeDirectoryAsync: fsMocks.makeDirectoryAsync,
  copyAsync: fsMocks.copyAsync,
  getInfoAsync: fsMocks.getInfoAsync,
  deleteAsync: fsMocks.deleteAsync,
}));

vi.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

import { deleteLocalRecipePhoto, saveLocalRecipePhoto } from "../lib/localRecipePhotos";

describe("local recipe photos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fsMocks.getInfoAsync.mockResolvedValue({ exists: true });
  });

  it("copies a picked image into the persistent recipe-photo directory", async () => {
    const photo = await saveLocalRecipePhoto({
      uri: "file://picker/original.jpg",
      mimeType: "image/jpeg",
      recipeName: "Chicken with Broccoli",
    });

    expect(fsMocks.makeDirectoryAsync).toHaveBeenCalledWith("file://documents/recipe-photos/", {
      intermediates: true,
    });
    expect(fsMocks.copyAsync).toHaveBeenCalledWith({
      from: "file://picker/original.jpg",
      to: expect.stringMatching(/^file:\/\/documents\/recipe-photos\/Chicken-with-Broccoli-\d+\.jpg$/),
    });
    expect(photo.localUri).toMatch(/^file:\/\/documents\/recipe-photos\//);
    expect(photo.mimeType).toBe("image/jpeg");
  });

  it("deletes the copied local image when the recipe photo is removed", async () => {
    await deleteLocalRecipePhoto({
      localUri: "file://documents/recipe-photos/chicken.jpg",
      mimeType: "image/jpeg",
      savedAt: 1,
    });

    expect(fsMocks.deleteAsync).toHaveBeenCalledWith("file://documents/recipe-photos/chicken.jpg", {
      idempotent: true,
    });
  });
});
