import { ScrollView, Text, View, Pressable, FlatList, TextInput } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useRecipes } from '@/lib/RecipeContext';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const { settings, updateSettings } = useRecipes();
  const [defaultServings, setDefaultServings] = useState(settings.defaultServings);
  const [pantryStaples, setPantryStaples] = useState(settings.pantryStaples);
  const [newStapleName, setNewStapleName] = useState('');

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

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="p-4 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">Settings</Text>
            <Text className="text-sm text-muted">Customize your preferences</Text>
          </View>

          {/* Default Servings */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Default Servings</Text>
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
                    className={`font-semibold ${
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
            <Text className="text-sm font-semibold text-foreground">Pantry Staples</Text>
            <Text className="text-xs text-muted">
              Items you always have in stock (won't appear in grocery list)
            </Text>

            {/* Add New Staple */}
            <View className="flex-row gap-2">
              <TextInput
                placeholder="Add staple..."
                placeholderTextColor="#9BA1A6"
                value={newStapleName}
                onChangeText={setNewStapleName}
                className="flex-1 p-3 bg-surface border border-border rounded-lg text-foreground"
              />
              <Pressable
                onPress={handleAddPantryStaple}
                style={({ pressed }) => [
                  { transform: [{ scale: pressed ? 0.95 : 1 }] },
                ]}
                className="px-4 py-3 bg-primary rounded-lg items-center justify-center"
              >
                <Text className="font-semibold text-white">+</Text>
              </Pressable>
            </View>

            {/* Staples List */}
            <FlatList
              data={pantryStaples}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View className="flex-row items-center justify-between p-3 bg-surface rounded-lg border border-border mb-2">
                  <Pressable
                    onPress={() => handleTogglePantryStaple(item.id)}
                    style={({ pressed }) => [
                      { opacity: pressed ? 0.7 : 1 },
                    ]}
                    className="flex-1 flex-row items-center gap-3"
                  >
                    <View
                      className={`w-5 h-5 rounded border-2 items-center justify-center ${
                        item.isActive
                          ? 'bg-success border-success'
                          : 'border-border bg-background'
                      }`}
                    >
                      {item.isActive && <Text className="text-white text-xs font-bold">✓</Text>}
                    </View>
                    <Text
                      className={`flex-1 text-base ${
                        item.isActive ? 'text-foreground' : 'text-muted'
                      }`}
                    >
                      {item.name}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleRemovePantryStaple(item.id)}
                    style={({ pressed }) => [
                      { transform: [{ scale: pressed ? 0.9 : 1 }] },
                    ]}
                    className="p-2"
                  >
                    <Text className="text-lg">✕</Text>
                  </Pressable>
                </View>
              )}
            />
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleSaveSettings}
            style={({ pressed }) => [
              { transform: [{ scale: pressed ? 0.97 : 1 }] },
              { opacity: pressed ? 0.8 : 1 },
            ]}
            className="mt-6 p-4 bg-primary rounded-lg items-center"
          >
            <Text className="font-semibold text-white text-base">Save Settings</Text>
          </Pressable>

          {/* App Info */}
          <View className="gap-2 mt-6 p-4 bg-surface rounded-lg border border-border">
            <Text className="text-sm font-semibold text-foreground">MakanPlan</Text>
            <Text className="text-xs text-muted">Version 1.0.0</Text>
            <Text className="text-xs text-muted mt-2">
              Weekly dinner planning for Singapore home cooks
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
