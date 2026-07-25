import { ScrollView, Text, View, Pressable, TextInput, ActivityIndicator, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useRecipes } from '@/lib/RecipeContext';
import { useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { exportRecipesAsJSON, importRecipesFromJSON } from '@/lib/recipeBackup';
import { getCloudBackupConfig, disconnectCloudBackup } from '@/lib/cloudBackup';
import * as DocumentPicker from 'expo-document-picker';

export default function SettingsScreen() {
  const { settings, updateSettings, recipes, addRecipe } = useRecipes();
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
        // Read file content
        const fileUri = result.uri as string;
        const response = await fetch(fileUri);
        const fileContent = await response.text();
        
        // Import recipes
        const importedRecipes = await importRecipesFromJSON(fileContent);

        // Add each imported recipe
        let addedCount = 0;
        for (const recipe of importedRecipes) {
          try {
            await addRecipe(recipe);
            addedCount++;
          } catch (err) {
            console.error(`Failed to add recipe ${recipe.name}:`, err);
          }
        }

        Alert.alert(
          'Import Successful',
          `Imported ${addedCount} recipes. They have been added to your library.`,
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Import failed:', error);
      Alert.alert('Import Failed', 'Could not import recipes. Please check the file format.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
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
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="p-4 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Settings</Text>
            <Text className="text-base text-muted">Customize your preferences & backups</Text>
          </View>

          {/* Default Servings */}
          <View className="gap-3">
            <Text className="text-lg font-bold text-foreground">Default Servings</Text>
            <View className="flex-row gap-2">
              {[1, 2, 3, 4].map((count) => (
                <Pressable
                  key={count}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setDefaultServings(count);
                  }}
                  style={({ pressed }) => [
                    { transform: [{ scale: pressed ? 0.95 : 1 }] },
                  ]}
                  className={`flex-1 py-3 rounded-lg items-center ${
                    defaultServings === count ? 'bg-primary' : 'bg-surface border border-border'
                  }`}
                >
                  <Text
                    className={`font-bold ${
                      defaultServings === count ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {count}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Pantry Staples */}
          <View className="gap-3">
            <Text className="text-lg font-bold text-foreground">Pantry Staples</Text>
            <Text className="text-sm text-muted">Items to exclude from grocery lists</Text>

            {/* Add new staple */}
            <View className="flex-row gap-2">
              <TextInput
                placeholder="Add staple (e.g., soy sauce)"
                value={newStapleName}
                onChangeText={setNewStapleName}
                className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-foreground"
                placeholderTextColor="#999"
              />
              <Pressable
                onPress={handleAddPantryStaple}
                style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.95 : 1 }] }]}
                className="px-4 py-2 bg-primary rounded-lg items-center justify-center"
              >
                <Text className="font-bold text-white">+</Text>
              </Pressable>
            </View>

            {/* List of staples */}
            <View className="gap-2">
              {pantryStaples.map((staple) => (
                <View key={staple.id} className="flex-row items-center justify-between p-3 bg-surface rounded-lg border border-border">
                  <Pressable
                    onPress={() => handleTogglePantryStaple(staple.id)}
                    className="flex-1"
                  >
                    <Text className={`text-base font-semibold ${staple.isActive ? 'text-foreground' : 'text-muted line-through'}`}>
                      {staple.isActive ? '✓' : '○'} {staple.name}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleRemovePantryStaple(staple.id)}
                    style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.95 : 1 }] }]}
                    className="px-2 py-1 bg-error rounded"
                  >
                    <Text className="text-white font-bold text-sm">×</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>

          {/* Backup Section */}
          <View className="gap-4 p-4 bg-surface rounded-lg border border-border">
            <Text className="text-lg font-bold text-foreground">📱 Recipe Backups</Text>

            {/* Local JSON Export */}
            <View className="gap-2">
              <Text className="text-base font-semibold text-foreground">Option 1: Local JSON Export</Text>
              <Text className="text-sm text-muted">Download all recipes as a JSON file. Email or save to cloud storage.</Text>
              <Pressable
                onPress={handleExportRecipes}
                disabled={isExporting}
                style={({ pressed }) => [
                  { transform: [{ scale: pressed && !isExporting ? 0.97 : 1 }] },
                  { opacity: pressed && !isExporting ? 0.8 : 1 },
                ]}
                className="p-3 bg-primary rounded-lg items-center"
              >
                {isExporting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="font-bold text-white">📥 Export All Recipes as JSON</Text>
                )}
              </Pressable>
            </View>

            {/* Local JSON Import */}
            <View className="gap-2 pt-3 border-t border-border">
              <Text className="text-base font-semibold text-foreground">Option 1b: Import JSON</Text>
              <Text className="text-sm text-muted">Upload a JSON backup file to add recipes to your library.</Text>
              <Pressable
                onPress={handleImportRecipes}
                disabled={isImporting}
                style={({ pressed }) => [
                  { transform: [{ scale: pressed && !isImporting ? 0.97 : 1 }] },
                  { opacity: pressed && !isImporting ? 0.8 : 1 },
                ]}
                className="p-3 bg-primary rounded-lg items-center"
              >
                {isImporting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="font-bold text-white">📤 Import Recipes from JSON</Text>
                )}
              </Pressable>
            </View>

            {/* Cloud Backup */}
            <View className="gap-2 pt-3 border-t border-border">
              <Text className="text-base font-semibold text-foreground">Option 2: Cloud Backup</Text>
              <Text className="text-sm text-muted">Auto-sync recipes to Google Drive or OneDrive</Text>
              
              {cloudConfig?.provider ? (
                <View className="gap-2">
                  <View className="p-3 bg-background rounded-lg border border-success">
                    <Text className="text-sm font-semibold text-success">
                      ✅ Connected to {cloudConfig.provider === 'google-drive' ? 'Google Drive' : 'OneDrive'}
                    </Text>
                    {cloudConfig.lastSyncDate && (
                      <Text className="text-xs text-muted mt-1">
                        Last sync: {new Date(cloudConfig.lastSyncDate).toLocaleString()}
                      </Text>
                    )}
                  </View>
                  <Pressable
                    onPress={handleDisconnectCloud}
                    style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.97 : 1 }] }]}
                    className="p-3 bg-error rounded-lg items-center"
                  >
                    <Text className="font-bold text-white">🔌 Disconnect Cloud Backup</Text>
                  </Pressable>
                </View>
              ) : (
                <View className="gap-2">
                  <Text className="text-sm text-muted">Coming soon: Connect your Google Drive or OneDrive account for automatic recipe backups.</Text>
                  <Pressable
                    disabled
                    className="p-3 bg-surface rounded-lg items-center opacity-50 border border-border"
                  >
                    <Text className="font-bold text-foreground">🔗 Connect Cloud Account (Coming Soon)</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleSaveSettings}
            style={({ pressed }) => [
              { transform: [{ scale: pressed ? 0.97 : 1 }] },
              { opacity: pressed ? 0.8 : 1 },
            ]}
            className="p-4 bg-primary rounded-lg items-center"
          >
            <Text className="font-bold text-white text-lg">💾 Save Settings</Text>
          </Pressable>

          {/* Spacing */}
          <View className="h-4" />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
