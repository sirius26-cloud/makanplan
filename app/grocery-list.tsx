import { ScrollView, Text, View, Pressable, FlatList, Share } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useRecipes } from '@/lib/RecipeContext';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { generateGroceryList, groupGroceryItems } from '@/lib/groceryList';
import { GroceryItem } from '@/lib/types';
import * as Haptics from 'expo-haptics';

export default function GroceryListScreen() {
  const { weeklyPlan, settings } = useRecipes();
  const router = useRouter();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [grouped, setGrouped] = useState<Record<string, GroceryItem[]>>({});

  useEffect(() => {
    if (weeklyPlan && settings) {
      const generatedItems = generateGroceryList(weeklyPlan, settings.pantryStaples);
      setItems(generatedItems);
      setGrouped(groupGroceryItems(generatedItems));
    }
  }, [weeklyPlan, settings]);

  const handleToggleItem = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = items.map((item) =>
      item.id === id ? { ...item, isChecked: !item.isChecked } : item,
    );
    setItems(updated);
    setGrouped(groupGroceryItems(updated));
  };

  const handleClearChecked = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updated = items.filter((item) => !item.isChecked);
    setItems(updated);
    setGrouped(groupGroceryItems(updated));
  };

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const listText = Object.entries(grouped)
        .map(([category, categoryItems]) => {
          const itemLines = categoryItems
            .map((item) => `${item.isChecked ? '✓' : '○'} ${item.name}`)
            .join('\n');
          return `${category}\n${itemLines}`;
        })
        .join('\n\n');

      await Share.share({
        message: `MakanPlan Grocery List\n\n${listText}`,
        title: 'MakanPlan Grocery List',
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (!weeklyPlan) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <Text className="text-foreground">No weekly plan to generate grocery list</Text>
      </ScreenContainer>
    );
  }

  const checkedCount = items.filter((i) => i.isChecked).length;

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="p-4 gap-4">
          {/* Header */}
          <View className="gap-2">
            <Pressable onPress={handleBack} className="mb-2">
              <Text className="text-lg text-primary font-semibold">← Back</Text>
            </Pressable>
            <Text className="text-2xl font-bold text-foreground">Grocery List</Text>
            <Text className="text-sm text-muted">
              {checkedCount} of {items.length} items checked
            </Text>
          </View>

          {/* Grocery Items by Category */}
          {Object.entries(grouped).map(([category, categoryItems]) =>
            categoryItems.length > 0 ? (
              <View key={category} className="gap-3">
                <Text className="text-sm font-semibold text-foreground">{category}</Text>
                <FlatList
                  data={categoryItems}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => handleToggleItem(item.id)}
                      style={({ pressed }) => [
                        { opacity: pressed ? 0.7 : 1 },
                      ]}
                      className="flex-row items-center gap-3 py-2 px-3 rounded-lg active:bg-surface"
                    >
                      <View
                        className={`w-6 h-6 rounded border-2 items-center justify-center ${
                          item.isChecked
                            ? 'bg-success border-success'
                            : 'border-border bg-background'
                        }`}
                      >
                        {item.isChecked && <Text className="text-white font-bold">✓</Text>}
                      </View>
                      <Text
                        className={`flex-1 text-base ${
                          item.isChecked
                            ? 'text-muted line-through'
                            : 'text-foreground'
                        }`}
                      >
                        {item.name}
                      </Text>
                    </Pressable>
                  )}
                />
              </View>
            ) : null,
          )}

          {/* Action Buttons */}
          <View className="gap-3 mt-6">
            <Pressable
              onPress={handleShare}
              style={({ pressed }) => [
                { transform: [{ scale: pressed ? 0.97 : 1 }] },
                { opacity: pressed ? 0.8 : 1 },
              ]}
              className="p-4 bg-primary rounded-lg items-center"
            >
              <Text className="font-semibold text-white">Share List</Text>
            </Pressable>

            {checkedCount > 0 && (
              <Pressable
                onPress={handleClearChecked}
                style={({ pressed }) => [
                  { transform: [{ scale: pressed ? 0.97 : 1 }] },
                  { opacity: pressed ? 0.8 : 1 },
                ]}
                className="p-4 bg-surface border border-border rounded-lg items-center"
              >
                <Text className="font-semibold text-foreground">Clear Checked Items</Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
