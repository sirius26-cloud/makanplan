import { ScrollView, Text, View, Pressable, FlatList, Share, Platform, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useRecipes } from '@/lib/RecipeContext';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { generateGroceryList, groupGroceryItems } from '@/lib/groceryList';
import { formatGroceryListForExport, generateEmailSubject, generateEmailBody } from '@/lib/exportGroceryList';
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

  const handleExportToNotes = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const listText = formatGroceryListForExport(items);

      // On iOS, we can use the Notes app via URL scheme
      // On Android, we'll use the Share sheet to send to Notes
      if (Platform.OS === 'ios') {
        // iOS Notes URL scheme (if available)
        const notesURL = `notes://new?text=${encodeURIComponent(listText)}`;
        try {
          // Try to open Notes app directly
          const { Linking } = require('react-native');
          await Linking.openURL(notesURL);
        } catch {
          // Fallback to share sheet
          await Share.share({
            message: listText,
            title: 'MakanPlan Grocery List',
          });
        }
      } else {
        // Android: use share sheet
        await Share.share({
          message: listText,
          title: 'MakanPlan Grocery List',
        });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to export to Notes:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleExportToEmail = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const subject = generateEmailSubject();
      const body = generateEmailBody(items);

      // Use mailto: URL scheme to open email client
      const { Linking } = require('react-native');
      const mailtoURL = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      await Linking.openURL(mailtoURL);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to export to email:', error);
      Alert.alert('Error', 'Could not open email app. Please try using Share instead.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const listText = formatGroceryListForExport(items);
      const { Clipboard } = require('react-native');
      await Clipboard.setString(listText);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Copied', 'Grocery list copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
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
              <Text className="text-lg text-primary font-bold">← Back</Text>
            </Pressable>
            <Text className="text-3xl font-bold text-foreground">Grocery List</Text>
            <Text className="text-base text-muted">
              {checkedCount} of {items.length} items checked
            </Text>
          </View>

          {/* Grocery Items by Category */}
          {Object.entries(grouped).map(([category, categoryItems]) =>
            categoryItems.length > 0 ? (
              <View key={category} className="gap-3">
                <Text className="text-lg font-bold text-foreground">{category}</Text>
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
                      className="flex-row items-center gap-3 py-3 px-4 rounded-lg bg-surface border border-border"
                    >
                      <View
                        className={`w-6 h-6 rounded border-2 items-center justify-center ${
                          item.isChecked
                            ? 'bg-success border-success'
                            : 'border-border bg-background'
                        }`}
                      >
                        {item.isChecked && <Text className="text-white font-bold text-sm">✓</Text>}
                      </View>
                      <Text
                        className={`flex-1 text-lg ${
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

          {/* Export Options */}
          <View className="gap-3 mt-6 p-4 bg-surface rounded-lg border border-border">
            <Text className="text-sm font-bold text-foreground mb-2">Export Grocery List:</Text>

            <Pressable
              onPress={handleExportToEmail}
              style={({ pressed }) => [
                { transform: [{ scale: pressed ? 0.97 : 1 }] },
                { opacity: pressed ? 0.8 : 1 },
              ]}
              className="p-3 bg-primary rounded-lg items-center flex-row justify-center gap-2"
            >
              <Text className="font-bold text-white text-base">📧 Export to Email</Text>
            </Pressable>

            <Pressable
              onPress={handleExportToNotes}
              style={({ pressed }) => [
                { transform: [{ scale: pressed ? 0.97 : 1 }] },
                { opacity: pressed ? 0.8 : 1 },
              ]}
              className="p-3 bg-primary rounded-lg items-center flex-row justify-center gap-2"
            >
              <Text className="font-bold text-white text-base">📝 Export to Notes</Text>
            </Pressable>

            <Pressable
              onPress={handleCopyToClipboard}
              style={({ pressed }) => [
                { transform: [{ scale: pressed ? 0.97 : 1 }] },
                { opacity: pressed ? 0.8 : 1 },
              ]}
              className="p-3 bg-primary rounded-lg items-center flex-row justify-center gap-2"
            >
              <Text className="font-bold text-white text-base">📋 Copy to Clipboard</Text>
            </Pressable>

            <Pressable
              onPress={handleShare}
              style={({ pressed }) => [
                { transform: [{ scale: pressed ? 0.97 : 1 }] },
                { opacity: pressed ? 0.8 : 1 },
              ]}
              className="p-3 bg-surface border-2 border-primary rounded-lg items-center flex-row justify-center gap-2"
            >
              <Text className="font-bold text-primary text-base">🔗 Share List</Text>
            </Pressable>
          </View>

          {/* Clear Checked Items */}
          {checkedCount > 0 && (
            <Pressable
              onPress={handleClearChecked}
              style={({ pressed }) => [
                { transform: [{ scale: pressed ? 0.97 : 1 }] },
                { opacity: pressed ? 0.8 : 1 },
              ]}
              className="p-4 bg-error/10 border border-error rounded-lg items-center"
            >
              <Text className="font-bold text-error text-base">Clear Checked Items</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
