import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";

import { RecipePhotoView } from "@/components/recipe-photo";
import { deleteLocalRecipePhoto, saveLocalRecipePhoto } from "@/lib/localRecipePhotos";
import type { RecipePhoto } from "@/lib/types";
import { useState } from "react";

type RecipePhotoPickerProps = {
  photo?: RecipePhoto;
  recipeName: string;
  onChange: (photo: RecipePhoto | undefined) => void;
  compact?: boolean;
};

export function RecipePhotoPicker({ photo, recipeName, onChange, compact = false }: RecipePhotoPickerProps) {
  const [isSaving, setIsSaving] = useState(false);
  const isWeb = Platform.OS === "web";

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

      setIsSaving(true);
      const savedPhoto = await saveLocalRecipePhoto({
        uri: result.assets[0].uri,
        mimeType: result.assets[0].mimeType,
        recipeName,
      });
      onChange(savedPhoto);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert(
        "Could not add photo",
        error instanceof Error ? error.message : "Please try again.",
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };

  const startPhotoSelection = () => {
    if (Platform.OS === "web") {
      Alert.alert("Mobile feature", "Local recipe photos are available in the mobile app.");
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
      "This removes the saved photo from this recipe and this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                setIsSaving(true);
                await deleteLocalRecipePhoto(photo);
                onChange(undefined);
              } catch {
                Alert.alert("Could not remove photo", "Please try again.");
              } finally {
                setIsSaving(false);
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Recipe Photo</Text>
      <Text style={styles.helper}>Optional. Saved privately on this device.</Text>
      {!compact && (photo ? <RecipePhotoView photo={photo} variant="editor" /> : <View style={styles.placeholder}><Text style={styles.placeholderText}>No photo attached</Text></View>)}
      <Pressable
        accessibilityRole="button"
        disabled={isSaving || isWeb}
        onPress={isWeb ? undefined : startPhotoSelection}
        style={({ pressed }) => [styles.primaryButton, (pressed || isSaving) && styles.pressed, isWeb && styles.webDisabledButton]}
      >
        <Text style={styles.primaryButtonText}>
          {isWeb ? "Photos are available in the mobile app" : isSaving ? "Saving Photo…" : photo ? "Replace Photo" : "Add Photo"}
        </Text>
      </Pressable>
      {photo ? (
        <Pressable
          accessibilityRole="button"
          disabled={isSaving}
          onPress={removePhoto}
          style={({ pressed }) => [styles.removeButton, (pressed || isSaving) && styles.pressed]}
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
  webDisabledButton: { backgroundColor: "#7F8C8D", opacity: 0.72 },
  removeButton: { minHeight: 40, borderRadius: 10, borderWidth: 1, borderColor: "#E74C3C", alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  removeButtonText: { color: "#E74C3C", fontWeight: "600", fontSize: 15 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
