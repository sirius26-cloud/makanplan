import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";

import { RecipePhotoView } from "@/components/recipe-photo";
import { useGoogleDriveRecipePhoto } from "@/hooks/use-google-drive-recipe-photo";
import type { RecipePhoto } from "@/lib/types";

type RecipePhotoPickerProps = {
  photo?: RecipePhoto;
  recipeName: string;
  onChange: (photo: RecipePhoto | undefined) => void;
};

export function RecipePhotoPicker({ photo, recipeName, onChange }: RecipePhotoPickerProps) {
  const { uploadPhoto, isUploading } = useGoogleDriveRecipePhoto();

  const selectPhoto = async (source: "library" | "camera") => {
    try {
      if (source === "camera") {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.status !== "granted") {
          Alert.alert("Camera permission needed", "Allow camera access to take a recipe photo.");
          return;
        }
      }
      const result = source === "camera"
        ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
          });
      if (result.canceled || !result.assets[0]) return;

      const uploaded = await uploadPhoto({
        uri: result.assets[0].uri,
        mimeType: result.assets[0].mimeType,
        recipeName,
      });
      onChange(uploaded);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert(
        "Could not add photo",
        error instanceof Error ? error.message : "Please try again.",
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const startPhotoSelection = () => {
    if (Platform.OS !== "ios") {
      Alert.alert("iOS feature", "Recipe photo uploads are available in the iOS app.");
      return;
    }
    Alert.alert("Recipe photo", "Attach one photo to this recipe.", [
      { text: "Photo Library", onPress: () => void selectPhoto("library") },
      {
        text: "Take Photo",
        onPress: () => void selectPhoto("camera"),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const removePhoto = () => {
    Alert.alert(
      "Remove recipe photo?",
      "This removes the photo from this recipe. The original remains in your Google Drive.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => onChange(undefined),
        },
      ],
    );
  };

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Recipe Photo</Text>
      <Text style={styles.helper}>Optional. Stored privately in your connected Google Drive.</Text>
      {photo ? <RecipePhotoView photo={photo} variant="editor" /> : <View style={styles.placeholder}><Text style={styles.placeholderText}>No photo attached</Text></View>}
      <Pressable
        accessibilityRole="button"
        disabled={isUploading}
        onPress={startPhotoSelection}
        style={({ pressed }) => [styles.primaryButton, (pressed || isUploading) && styles.pressed]}
      >
        <Text style={styles.primaryButtonText}>{isUploading ? "Uploading to Google Drive…" : photo ? "Replace Photo" : "Add Photo"}</Text>
      </Pressable>
      {photo ? (
        <Pressable
          accessibilityRole="button"
          disabled={isUploading}
          onPress={removePhoto}
          style={({ pressed }) => [styles.removeButton, (pressed || isUploading) && styles.pressed]}
        >
          <Text style={styles.removeButtonText}>Remove from Recipe</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 10 },
  title: { fontSize: 18, lineHeight: 24, fontWeight: "700", color: "#11181C" },
  helper: { fontSize: 13, lineHeight: 18, color: "#687076" },
  placeholder: { height: 180, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center" },
  placeholderText: { color: "#687076", fontSize: 14 },
  primaryButton: { minHeight: 46, borderRadius: 10, backgroundColor: "#E85D2A", alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  removeButton: { minHeight: 40, borderRadius: 10, borderWidth: 1, borderColor: "#E74C3C", alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  removeButtonText: { color: "#E74C3C", fontWeight: "600", fontSize: 15 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
