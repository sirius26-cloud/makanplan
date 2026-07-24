import { ScrollView, Text, View, Pressable, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useRecipes } from '@/lib/RecipeContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function RecipeDetailScreen() {
  const { recipes, toggleFavourite, toggleStaple, deleteRecipe } = useRecipes();
  const { recipeId } = useLocalSearchParams();
  const router = useRouter();

  const recipe = recipes.find((r) => r.id === recipeId);

  if (!recipe) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <Text className="text-foreground">Recipe not found</Text>
      </ScreenContainer>
    );
  }

  const handleToggleFavourite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavourite(recipe.id);
  };

  const handleToggleStaple = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleStaple(recipe.id);
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/edit-recipe' as any,
      params: { recipeId: recipe.id },
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Recipe',
      `Are you sure you want to delete "${recipe.name}"? This cannot be undone.`,
      [
        {
          text: 'Cancel',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await deleteRecipe(recipe.id);
            router.back();
          },
          style: 'destructive',
        },
      ],
    );
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
            <Text className="text-3xl font-bold text-foreground">{recipe.name}</Text>
          </View>

          {/* Recipe Info */}
          <View className="gap-3 p-4 bg-surface rounded-lg border border-border">
            <View className="gap-2">
              <View className="flex-row gap-2 flex-wrap">
                <Text className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                  {recipe.type === 'protein_main'
                    ? 'Main'
                    : recipe.type === 'veg_side'
                      ? 'Veg'
                      : 'Rice/Noodle'}
                </Text>
                <Text className="text-xs bg-primary/20 text-primary px-2 py-1 rounded capitalize">
                  {recipe.protein}
                </Text>
                <Text className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                  {recipe.cuisineType}
                </Text>
                <Text className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                  {recipe.spiceLevel}
                </Text>
              </View>

              <View className="flex-row gap-2 mt-2">
                {recipe.hasVeg && (
                  <Text className="text-xs bg-success/20 text-success px-2 py-1 rounded">
                    Has Veg
                  </Text>
                )}
                {recipe.isRice && (
                  <Text className="text-xs bg-warning/20 text-warning px-2 py-1 rounded">
                    Rice-based
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Ingredients */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Ingredients</Text>
            <View className="p-4 bg-surface rounded-lg border border-border gap-2">
              {recipe.ingredients.map((ingredient, i) => (
                <Text key={i} className="text-base text-foreground">
                  • {ingredient}
                </Text>
              ))}
            </View>
          </View>

          {/* Instructions */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Instructions</Text>
            <View className="p-4 bg-surface rounded-lg border border-border">
              <Text className="text-base text-foreground leading-relaxed">
                {recipe.instructions}
              </Text>
            </View>
          </View>

          {/* Servings */}
          <View className="gap-2">
            <Text className="text-sm text-muted">Default Servings: {recipe.servings}</Text>
          </View>

          {/* Action Buttons */}
          <View className="gap-3 mt-4">
            <View className="flex-row gap-2">
              <Pressable
                onPress={handleToggleFavourite}
                style={({ pressed }) => [
                  { transform: [{ scale: pressed ? 0.97 : 1 }] },
                  { opacity: pressed ? 0.8 : 1 },
                ]}
                className={`flex-1 p-3 rounded-lg items-center ${
                  recipe.isFavourite
                    ? 'bg-primary'
                    : 'bg-surface border border-border'
                }`}
              >
                <Text
                  className={`font-semibold ${
                    recipe.isFavourite ? 'text-white' : 'text-foreground'
                  }`}
                >
                  {recipe.isFavourite ? '❤️ Favourite' : '🤍 Add to Favourite'}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleToggleStaple}
                style={({ pressed }) => [
                  { transform: [{ scale: pressed ? 0.97 : 1 }] },
                  { opacity: pressed ? 0.8 : 1 },
                ]}
                className={`flex-1 p-3 rounded-lg items-center ${
                  recipe.isStaple
                    ? 'bg-primary'
                    : 'bg-surface border border-border'
                }`}
              >
                <Text
                  className={`font-semibold ${
                    recipe.isStaple ? 'text-white' : 'text-foreground'
                  }`}
                >
                  {recipe.isStaple ? '⭐ Staple' : '☆ Mark Staple'}
                </Text>
              </Pressable>
            </View>

            <View className="flex-row gap-2">
              <Pressable
                onPress={handleEdit}
                style={({ pressed }) => [
                  { transform: [{ scale: pressed ? 0.97 : 1 }] },
                  { opacity: pressed ? 0.8 : 1 },
                ]}
                className="flex-1 p-3 bg-primary rounded-lg items-center"
              >
                <Text className="font-semibold text-white">✏️ Edit Recipe</Text>
              </Pressable>

              <Pressable
                onPress={handleDelete}
                style={({ pressed }) => [
                  { transform: [{ scale: pressed ? 0.97 : 1 }] },
                  { opacity: pressed ? 0.8 : 1 },
                ]}
                className="flex-1 p-3 bg-error/10 border border-error rounded-lg items-center"
              >
                <Text className="font-semibold text-error">🗑️ Delete</Text>
              </Pressable>
            </View>
          </View>

          {/* Spacing */}
          <View className="h-4" />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
