import { ScrollView, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useRecipes } from '@/lib/RecipeContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { regenerateMealDay } from '@/lib/mealGenerator';
import * as Haptics from 'expo-haptics';

export default function DayDetailScreen() {
  const { weeklyPlan, setWeeklyPlan, recipes } = useRecipes();
  const { dayIndex } = useLocalSearchParams();
  const router = useRouter();
  const [isShuffling, setIsShuffling] = useState(false);

  const index = parseInt(dayIndex as string, 10);
  const day = weeklyPlan?.days[index];

  if (!day || !weeklyPlan) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <Text className="text-foreground">Day not found</Text>
      </ScreenContainer>
    );
  }

  const handleShuffle = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsShuffling(true);

      const newMealDay = regenerateMealDay(recipes, weeklyPlan, index, weeklyPlan.proteinFilter);
      const updatedPlan = {
        ...weeklyPlan,
        days: weeklyPlan.days.map((d, i) => (i === index ? newMealDay : d)),
      };

      await setWeeklyPlan(updatedPlan);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to shuffle:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsShuffling(false);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="p-4 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Pressable onPress={handleBack} className="mb-2">
              <Text className="text-lg text-primary font-semibold">← Back</Text>
            </Pressable>
            <Text className="text-2xl font-bold text-foreground">Day {day.day}</Text>
          </View>

          {/* Main Dish */}
          <View className="gap-3 p-4 bg-surface rounded-lg border border-border">
            <Text className="text-sm font-semibold text-muted">Main Dish</Text>
            <Text className="text-2xl font-bold text-foreground">{day.main.name}</Text>

            <View className="gap-2 mt-2 pt-3 border-t border-border">
              <View className="flex-row gap-2">
                <Text className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                  {day.main.cuisineType}
                </Text>
                <Text className="text-xs bg-primary/20 text-primary px-2 py-1 rounded capitalize">
                  {day.main.protein}
                </Text>
              </View>

              <Text className="text-sm text-muted mt-2">Spice Level: {day.main.spiceLevel}</Text>

              <View className="mt-3">
                <Text className="text-xs font-semibold text-muted mb-2">Ingredients:</Text>
                {day.main.ingredients.map((ingredient, i) => (
                  <Text key={i} className="text-sm text-foreground">
                    • {ingredient}
                  </Text>
                ))}
              </View>

              <View className="mt-3">
                <Text className="text-xs font-semibold text-muted mb-2">Instructions:</Text>
                <Text className="text-sm text-foreground leading-relaxed">
                  {day.main.instructions}
                </Text>
              </View>
            </View>
          </View>

          {/* Veg Side */}
          {day.vegSide && (
            <View className="gap-3 p-4 bg-surface rounded-lg border border-border">
              <Text className="text-sm font-semibold text-muted">Vegetable Side</Text>
              <Text className="text-2xl font-bold text-foreground">{day.vegSide.name}</Text>

              <View className="gap-2 mt-2 pt-3 border-t border-border">
                <Text className="text-sm text-muted">Cuisine: {day.vegSide.cuisineType}</Text>

                <View className="mt-3">
                  <Text className="text-xs font-semibold text-muted mb-2">Ingredients:</Text>
                  {day.vegSide.ingredients.map((ingredient, i) => (
                    <Text key={i} className="text-sm text-foreground">
                      • {ingredient}
                    </Text>
                  ))}
                </View>

                <View className="mt-3">
                  <Text className="text-xs font-semibold text-muted mb-2">Instructions:</Text>
                  <Text className="text-sm text-foreground leading-relaxed">
                    {day.vegSide.instructions}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Shuffle Button */}
          <Pressable
            onPress={handleShuffle}
            disabled={isShuffling}
            style={({ pressed }) => [
              { transform: [{ scale: pressed && !isShuffling ? 0.97 : 1 }] },
              { opacity: pressed && !isShuffling ? 0.8 : 1 },
            ]}
            className="p-4 bg-primary rounded-lg items-center"
          >
            {isShuffling ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="font-semibold text-white text-base">Shuffle This Day</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
