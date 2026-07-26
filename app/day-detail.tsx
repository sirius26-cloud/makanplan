import { ScrollView, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useRecipes } from '@/lib/RecipeContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { regenerateMealDay, generateMealDayWithFormat } from '@/lib/mealGenerator';
import { scaleRecipe, getServingSizes } from '@/lib/recipeScaling';
import { Recipe, MealDay } from '@/lib/types';
import * as Haptics from 'expo-haptics';

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  protein_main: { bg: '#FFE5D9', text: '#E85D2A', border: '#E85D2A' },
  veg_side: { bg: '#D4E8D4', text: '#2D5016', border: '#2D5016' },
  rice_noodle_one_pot: { bg: '#FFF4D9', text: '#F39C12', border: '#F39C12' },
};

function getCategoryColor(type: string) {
  return CATEGORY_COLORS[type] || { bg: '#F5F5F5', text: '#7F8C8D', border: '#E5E5E5' };
}

function RecipeCard({ recipe, isScaled }: { recipe: Recipe; isScaled: boolean }) {
  const color = getCategoryColor(recipe.type);

  return (
    <View className="gap-3 p-4 bg-surface rounded-lg border border-border">
      {/* Recipe Header */}
      <View
        className="p-3 rounded-lg border-2 gap-2"
        style={{
          backgroundColor: color.bg,
          borderColor: color.border,
        }}
      >
        <Text className="text-xs font-bold" style={{ color: color.text }}>
          {recipe.type === 'protein_main'
            ? 'MAIN'
            : recipe.type === 'veg_side'
              ? 'VEG SIDE'
              : 'RICE/NOODLE'}
        </Text>
        <Text className="text-2xl font-bold" style={{ color: color.text }}>
          {recipe.name}
        </Text>
      </View>

      {/* Recipe Info */}
      <View className="gap-2">
        <View className="flex-row gap-2 flex-wrap">
          <Text className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
            {recipe.cuisineType}
          </Text>
          <Text className="text-xs bg-warning/20 text-warning px-2 py-1 rounded">
            {recipe.spiceLevel}
          </Text>
        </View>

        {/* Ingredients */}
        <View className="gap-1">
          <Text className="text-sm font-semibold text-foreground">Ingredients:</Text>
          {recipe.ingredients.map((ing, idx) => (
            <Text key={idx} className="text-sm text-muted">
              • {ing}
            </Text>
          ))}
        </View>

        {/* Instructions */}
        <View className="gap-1">
          <Text className="text-sm font-semibold text-foreground">Instructions:</Text>
          <Text className="text-sm text-muted leading-relaxed">{recipe.instructions}</Text>
        </View>

        {/* Scaling Indicator */}
        {isScaled && (
          <Text className="text-xs text-success font-semibold">
            ✓ Scaled for {recipe.servings} pax
          </Text>
        )}
      </View>
    </View>
  );
}

export default function DayDetailScreen() {
  const { weeklyPlan, setWeeklyPlan, recipes, settings } = useRecipes();
  const { dayIndex } = useLocalSearchParams();
  const router = useRouter();
  const [isShuffling, setIsShuffling] = useState(false);
  const [isTogglingFormat, setIsTogglingFormat] = useState(false);
  const [scaledServings, setScaledServings] = useState(settings.defaultServings);
  const [scaledMain, setScaledMain] = useState<Recipe | null>(null);
  const [scaledVeg, setScaledVeg] = useState<Recipe | null>(null);

  const index = parseInt(dayIndex as string, 10);
  const day = weeklyPlan?.days[index];

  useEffect(() => {
    if (day) {
      setScaledMain(scaleRecipe(day.main, scaledServings));
      setScaledVeg(day.vegSide ? scaleRecipe(day.vegSide, scaledServings) : null);
    }
  }, [day, scaledServings]);

  if (!day || !weeklyPlan) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <Text className="text-foreground text-lg">Day not found</Text>
      </ScreenContainer>
    );
  }

  const servingSizes = getServingSizes(day.main.servings);

  const handleShuffle = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsShuffling(true);

      const newMealDay = regenerateMealDay(recipes, weeklyPlan, index, weeklyPlan.proteinFilters);
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

  const handleToggleFormat = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsTogglingFormat(true);

      const newFormat = day.format === 'one-pot' ? 'main-veg' : 'one-pot';
      const newMealDay = await generateMealDayWithFormat(
        recipes,
        weeklyPlan,
        index,
        newFormat,
        weeklyPlan.proteinFilters
      );

      const updatedPlan = {
        ...weeklyPlan,
        days: weeklyPlan.days.map((d, i) => (i === index ? newMealDay : d)),
      };

      await setWeeklyPlan(updatedPlan);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to toggle format:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsTogglingFormat(false);
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
              <Text className="text-lg text-primary font-bold">← Back</Text>
            </Pressable>
            <Text className="text-3xl font-bold text-foreground">Day {day.day}</Text>
            <Text className="text-base text-muted">
              {day.format === 'one-pot' ? '🍲 One-Pot Meal' : '🍽️ Main + Veg'}
            </Text>
          </View>

          {/* Serving Size Selector */}
          <View className="gap-3 p-4 bg-surface rounded-lg border border-border">
            <Text className="text-lg font-bold text-foreground">Adjust Recipe for:</Text>
            <View className="flex-row gap-2 flex-wrap">
              {servingSizes.map((size) => (
                <Pressable
                  key={size}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setScaledServings(size);
                  }}
                  style={({ pressed }) => [
                    { transform: [{ scale: pressed ? 0.95 : 1 }] },
                  ]}
                  className={`px-4 py-2 rounded-full border-2 ${
                    scaledServings === size
                      ? 'bg-primary border-primary'
                      : 'bg-background border-border'
                  }`}
                >
                  <Text
                    className={`font-bold text-base ${
                      scaledServings === size ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {size} pax
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Main Dish */}
          {scaledMain && <RecipeCard recipe={scaledMain} isScaled={scaledServings !== day.main.servings} />}

          {/* Veg Side */}
          {scaledVeg && day.vegSide && <RecipeCard recipe={scaledVeg} isScaled={scaledServings !== day.vegSide.servings} />}

          {/* Action Buttons */}
          <View className="gap-3">
            {/* Format Toggle Button */}
            <Pressable
              onPress={handleToggleFormat}
              disabled={isTogglingFormat}
              style={({ pressed }) => [
                { transform: [{ scale: pressed && !isTogglingFormat ? 0.97 : 1 }] },
                { opacity: pressed && !isTogglingFormat ? 0.8 : 1 },
              ]}
              className="p-4 bg-secondary rounded-lg items-center"
            >
              {isTogglingFormat ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="font-bold text-white text-lg">
                  {day.format === 'one-pot' ? '🍽️ Switch to Main + Veg' : '🍲 Switch to One-Pot'}
                </Text>
              )}
            </Pressable>

            {/* Rotate Dishes Button */}
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
                <Text className="font-bold text-white text-lg">🔄 Rotate Dishes</Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
