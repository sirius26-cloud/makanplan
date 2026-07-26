import { ScrollView, Text, View, Pressable, TextInput, ActivityIndicator, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useRecipes } from '@/lib/RecipeContext';
import { useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { exportRecipesAsJSON, importRecipesFromJSON } from '@/lib/recipeBackup';
import { getCloudBackupConfig, disconnectCloudBackup } from '@/lib/cloudBackup';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

export default function SettingsScreen() {
  const { settings, updateSettings, recipes, replaceAllRecipes, mergeImportedRecipes } = useRecipes();
  const [defaultServings, setDefaultServings] = useState(settings.defaultServings);
  const [pantryStaples, setPantryStaples] = useState(settings.pantryStaples);
  const [newStapleName, setNewStapleName] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [cloudConfig, setCloudConfig] = useState<any>(null);

  useEffect(() => {
    loadCloudConfig();
  }, []);

  const loadCloudConfig = async () => {
    try {
      const config = await getCloudBackupConfig();
      setCloudConfig(config);
    } catch (error) {
      console.error('Failed to load cloud config:', error);
    }
  };

  const handleSaveSettings = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateSettings({
      defaultServings,
      pantryStaples,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleTogglePantryStaple = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = pantryStaples.map((s) =>
      s.id === id ? { ...s, isActive: !s.isActive } : s,
    );
    setPantryStaples(updated);
  };

  const handleAddPantryStaple = () => {
    if (newStapleName.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newStaple = {
        id: `staple_${Date.now()}`,
        name: newStapleName.trim(),
        isActive: true,
      };
      setPantryStaples([...pantryStaples, newStaple]);
      setNewStapleName('');
    }
  };

  const handleRemovePantryStaple = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = pantryStaples.filter((s) => s.id !== id);
    setPantryStaples(updated);
  };

  const handleExportRecipes = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsExporting(true);
      await exportRecipesAsJSON(recipes);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('Export Failed', 'Could not export recipes. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportRecipes = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsImporting(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
      });

      if (result && 'uri' in result) {
        const fileUri = result.uri as string;
        const fileContent = await FileSystem.readAsStringAsync(fileUri);
        const importedRecipes = await importRecipesFromJSON(fileContent);

        // Show dialog to choose replace or add
        Alert.alert(
          'Import Recipes',
          `Found ${importedRecipes.length} recipes. What would you like to do?`,
          [
            {
              text: 'Cancel',
              onPress: () => setIsImporting(false),
              style: 'cancel',
            },
            {
              text: 'Replace All',
              onPress: async () => {
                try {
                  const count = await replaceAllRecipes(importedRecipes);
                  Alert.alert(
                    'Import Successful',
                    `Replaced library: ${count} recipes`,
                  );
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } catch (err) {
                  Alert.alert('Error', 'Failed to replace recipes');
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                } finally {
                  setIsImporting(false);
                }
              },
              style: 'destructive',
            },
            {
              text: 'Add to Library',
              onPress: async () => {
                try {
                  const { added, skipped } = await mergeImportedRecipes(importedRecipes);
                  let message = `Added ${added} new recipes`;
                  if (skipped > 0) {
                    message += `, skipped ${skipped} duplicates`;
                  }
                  Alert.alert('Import Successful', message);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } catch (err) {
                  Alert.alert('Error', 'Failed to add recipes');
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                } finally {
                  setIsImporting(false);
                }
              },
            },
          ],
        );
      } else {
        setIsImporting(false);
      }
    } catch (error) {
      console.error('Import failed:', error);
      Alert.alert('Import Failed', 'Could not import recipes. Please check the file format.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsImporting(false);
    }
  };

  const handleDisconnectCloud = async () => {
    Alert.alert(
      'Disconnect Cloud Backup',
      'Are you sure? Auto-sync will be disabled.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await disconnectCloudBackup();
              setCloudConfig(null);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              Alert.alert('Error', 'Failed to disconnect cloud backup');
            }
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
        <View className="gap-8">
          {/* Default Servings */}
          <View className="gap-3">
            <Text className="text-2xl font-bold text-foreground">Default Servings</Text>
            <View className="flex-row gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <Pressable
                  key={num}
                  onPress={() => setDefaultServings(num)}
                  style={({ pressed }) => [
                    {
                      opacity: pressed ? 0.7 : 1,
                      backgroundColor: defaultServings === num ? '#E85D2A' : '#f5f5f5',
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      flex: 1,
                      alignItems: 'center',
                    },
                  ]}
                >
                  <Text
                    className={`text-lg font-semibold ${
                      defaultServings === num ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {num}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Pantry Staples */}
          <View className="gap-3">
            <Text className="text-2xl font-bold text-foreground">Pantry Staples</Text>
            <Text className="text-base text-muted">Items to exclude from grocery lists</Text>

            {/* Add Staple Input */}
            <View className="flex-row gap-3">
              <TextInput
                placeholder="Add staple (e.g., soy sauce)"
                value={newStapleName}
                onChangeText={setNewStapleName}
                className="flex-1 border border-border rounded-lg px-4 py-3 text-foreground"
                placeholderTextColor="#9BA1A6"
              />
              <Pressable
                onPress={handleAddPantryStaple}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.8 : 1,
                    backgroundColor: '#E85D2A',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}
              >
                <Text className="text-white font-semibold text-lg">+</Text>
              </Pressable>
            </View>

            {/* Staples List */}
            <View className="gap-2">
              {pantryStaples.map((staple) => (
                <View
                  key={staple.id}
                  className="flex-row items-center justify-between bg-surface rounded-lg p-4 border border-border"
                >
                  <Pressable
                    onPress={() => handleTogglePantryStaple(staple.id)}
                    className="flex-1"
                  >
                    <Text
                      className={`text-base font-medium ${
                        staple.isActive
                          ? 'text-foreground'
                          : 'text-muted line-through'
                      }`}
                    >
                      {staple.isActive ? '✓' : '○'} {staple.name}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleRemovePantryStaple(staple.id)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  >
                    <Text className="text-error font-semibold">Remove</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>

          {/* Recipe Backups */}
          <View className="gap-3">
            <Text className="text-2xl font-bold text-foreground">Recipe Backups</Text>

            {/* Export */}
            <View className="gap-2">
              <Text className="text-base font-semibold text-foreground">Option 1a: Export All Recipes</Text>
              <Pressable
                onPress={handleExportRecipes}
                disabled={isExporting}
                style={({ pressed }) => [
                  {
                    opacity: pressed && !isExporting ? 0.8 : 1,
                    backgroundColor: '#E85D2A',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    alignItems: 'center',
                  },
                ]}
              >
                {isExporting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-base">📤 Export All Recipes as JSON</Text>
                )}
              </Pressable>
            </View>

            {/* Import */}
            <View className="gap-2">
              <Text className="text-base font-semibold text-foreground">Option 1b: Import Recipes from JSON</Text>
              <Pressable
                onPress={handleImportRecipes}
                disabled={isImporting}
                style={({ pressed }) => [
                  {
                    opacity: pressed && !isImporting ? 0.8 : 1,
                    backgroundColor: '#2D5016',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    alignItems: 'center',
                  },
                ]}
              >
                {isImporting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-base">📥 Import Recipes from JSON</Text>
                )}
              </Pressable>
            </View>

            {/* Cloud Backup Status */}
            {cloudConfig ? (
              <View className="gap-2">
                <Text className="text-base font-semibold text-foreground">Option 2: Cloud Backup</Text>
                <View className="bg-surface rounded-lg p-4 border border-border">
                  <Text className="text-sm text-foreground mb-2">✓ Cloud backup connected</Text>
                  <Pressable
                    onPress={handleDisconnectCloud}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  >
                    <Text className="text-error font-semibold">Disconnect</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View className="gap-2">
                <Text className="text-base font-semibold text-foreground">Option 2: Cloud Backup</Text>
                <View className="bg-surface rounded-lg p-4 border border-border">
                  <Text className="text-sm text-muted">Cloud backup not configured</Text>
                </View>
              </View>
            )}
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleSaveSettings}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.8 : 1,
                backgroundColor: '#E85D2A',
                paddingVertical: 14,
                paddingHorizontal: 16,
                borderRadius: 8,
                alignItems: 'center',
              },
            ]}
          >
            <Text className="text-white font-bold text-lg">Save Settings</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
