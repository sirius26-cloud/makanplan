import { ScrollView, Text, View, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useRecipes } from '@/lib/RecipeContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Recipe, RecipeType, ProteinType } from '@/lib/types';
import * as Haptics from 'expo-haptics';
import { RecipePhotoPicker } from '@/components/recipe-photo-picker';
import type { RecipePhoto } from '@/lib/types';

const RECIPE_TYPES: RecipeType[] = ['protein_main', 'veg_side', 'rice_noodle_one_pot'];
const PROTEIN_OPTIONS: ProteinType[] = ['chicken', 'fish', 'beef', 'seafood', 'tofu'];
const CUISINES = ['Japanese', 'Thai', 'Cantonese', 'Vietnamese', 'Western', 'Mixed'] as const;
const SPICE_LEVELS = ['light', 'light-medium', 'medium'] as const;

export default function EditRecipeScreen() {
  const { recipes, updateRecipe } = useRecipes();
  const router = useRouter();
  const { recipeId } = useLocalSearchParams();
  const [isSaving, setIsSaving] = useState(false);

  const recipe = recipes.find((r) => r.id === recipeId as string);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<RecipeType>('protein_main');
  const [protein, setProtein] = useState<ProteinType>('chicken');
  const [hasVeg, setHasVeg] = useState(false);
  const [isRice, setIsRice] = useState(false);
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [servings, setServings] = useState('4');
  const [cuisine, setCuisine] = useState<typeof CUISINES[number]>('Cantonese');
  const [spiceLevel, setSpiceLevel] = useState<typeof SPICE_LEVELS[number]>('light');
  const [isFavourite, setIsFavourite] = useState(false);
  const [isStaple, setIsStaple] = useState(false);
  const [photo, setPhoto] = useState<RecipePhoto | undefined>();

  // Load recipe data on mount
  useEffect(() => {
    if (recipe) {
      setName(recipe.name);
      setType(recipe.type);
      setProtein(recipe.protein);
      setHasVeg(recipe.hasVeg);
      setIsRice(recipe.isRice);
      setIngredients(recipe.ingredients.join('\n'));
      setInstructions(recipe.instructions);
      setServings(recipe.servings.toString());
      setCuisine(recipe.cuisineType as typeof CUISINES[number]);
      setSpiceLevel(recipe.spiceLevel as typeof SPICE_LEVELS[number]);
      setIsFavourite(recipe.isFavourite);
      setIsStaple(recipe.isStaple);
      setPhoto(recipe.photo);
    }
  }, [recipe]);

  const handleSave = async () => {
    if (!name.trim() || !recipe) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsSaving(true);

      const ingredientList = ingredients
        .split('\n')
        .map((ing) => ing.trim())
        .filter((ing) => ing.length > 0);

      const updatedRecipe: Recipe = {
        ...recipe,
        name: name.trim(),
        type,
        protein,
        hasVeg,
        isRice,
        isFavourite,
        isStaple,
        ingredients: ingredientList,
        instructions: instructions.trim(),
        servings: parseInt(servings) || 4,
        cuisineType: cuisine,
        spiceLevel,
        photo,
      };

      await updateRecipe(updatedRecipe);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error('Failed to save recipe:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (!recipe) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <Text className="text-foreground">Recipe not found</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="p-4 gap-4">
          {/* Header */}
          <View className="gap-2">
            <Pressable onPress={handleBack} className="mb-2">
              <Text className="text-lg text-primary font-bold">← Back</Text>
            </Pressable>
            <Text className="text-3xl font-bold text-foreground">Edit Recipe</Text>
            <Text className="text-base text-muted">Update the recipe details</Text>
          </View>

          {/* Recipe Name */}
          <View className="gap-2">
            <Text className="text-lg font-bold text-foreground">Recipe Name *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g., Chicken with Broccoli"
              placeholderTextColor="#999"
              className="p-3 bg-surface border border-border rounded-lg text-foreground text-base"
            />
          </View>

          <RecipePhotoPicker
            photo={photo}
            recipeName={name.trim() || 'recipe'}
            onChange={setPhoto}
          />

          {/* Recipe Type */}
          <View className="gap-2">
            <Text className="text-lg font-bold text-foreground">Type</Text>
            <View className="flex-row gap-2 flex-wrap">
              {RECIPE_TYPES.map((t) => (
                <Pressable
                  key={t}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setType(t);
                  }}
                  className={`px-3 py-2 rounded-full ${
                    type === t ? 'bg-primary' : 'bg-surface border border-border'
                  }`}
                >
                  <Text
                    className={`text-sm font-bold ${
                      type === t ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {t === 'protein_main' ? 'Main' : t === 'veg_side' ? 'Veg' : 'Rice/Noodle'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Protein */}
          <View className="gap-2">
            <Text className="text-lg font-bold text-foreground">Protein</Text>
            <View className="flex-row gap-2 flex-wrap">
              {PROTEIN_OPTIONS.map((p) => (
                <Pressable
                  key={p}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setProtein(p);
                  }}
                  className={`px-3 py-2 rounded-full ${
                    protein === p ? 'bg-primary' : 'bg-surface border border-border'
                  }`}
                >
                  <Text
                    className={`text-sm font-bold capitalize ${
                      protein === p ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {p}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Cuisine */}
          <View className="gap-2">
            <Text className="text-lg font-bold text-foreground">Cuisine</Text>
            <View className="flex-row gap-2 flex-wrap">
              {CUISINES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setCuisine(c);
                  }}
                  className={`px-3 py-2 rounded-full ${
                    cuisine === c ? 'bg-primary' : 'bg-surface border border-border'
                  }`}
                >
                  <Text
                    className={`text-sm font-bold ${
                      cuisine === c ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {c}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Spice Level */}
          <View className="gap-2">
            <Text className="text-lg font-bold text-foreground">Spice Level</Text>
            <View className="flex-row gap-2 flex-wrap">
              {SPICE_LEVELS.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSpiceLevel(s);
                  }}
                  className={`px-3 py-2 rounded-full ${
                    spiceLevel === s ? 'bg-primary' : 'bg-surface border border-border'
                  }`}
                >
                  <Text
                    className={`text-sm font-bold ${
                      spiceLevel === s ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {s}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Flags */}
          <View className="gap-2">
            <Text className="text-lg font-bold text-foreground">Flags</Text>
            <View className="gap-2">
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setHasVeg(!hasVeg);
                }}
                className="flex-row items-center gap-2 p-2"
              >
                <View
                  className={`w-6 h-6 rounded border-2 ${
                    hasVeg ? 'bg-primary border-primary' : 'border-border'
                  }`}
                />
                <Text className="text-base text-foreground">Has Vegetable Component</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsRice(!isRice);
                }}
                className="flex-row items-center gap-2 p-2"
              >
                <View
                  className={`w-6 h-6 rounded border-2 ${
                    isRice ? 'bg-primary border-primary' : 'border-border'
                  }`}
                />
                <Text className="text-base text-foreground">Rice-based One-Pot</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsFavourite(!isFavourite);
                }}
                className="flex-row items-center gap-2 p-2"
              >
                <View
                  className={`w-6 h-6 rounded border-2 ${
                    isFavourite ? 'bg-primary border-primary' : 'border-border'
                  }`}
                />
                <Text className="text-base text-foreground">⭐ Favourite</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsStaple(!isStaple);
                }}
                className="flex-row items-center gap-2 p-2"
              >
                <View
                  className={`w-6 h-6 rounded border-2 ${
                    isStaple ? 'bg-primary border-primary' : 'border-border'
                  }`}
                />
                <Text className="text-base text-foreground">📌 Staple (Appears Often)</Text>
              </Pressable>
            </View>
          </View>

          {/* Ingredients */}
          <View className="gap-2">
            <Text className="text-lg font-bold text-foreground">Ingredients *</Text>
            <Text className="text-sm text-muted">One per line. Include quantities (e.g., "600g chicken")</Text>
            <TextInput
              value={ingredients}
              onChangeText={setIngredients}
              placeholder="600g chicken&#10;3 tbsp soy sauce&#10;2 cloves garlic"
              placeholderTextColor="#999"
              multiline
              numberOfLines={5}
              className="p-3 bg-surface border border-border rounded-lg text-foreground text-base"
            />
          </View>

          {/* Instructions */}
          <View className="gap-2">
            <Text className="text-lg font-bold text-foreground">Instructions *</Text>
            <TextInput
              value={instructions}
              onChangeText={setInstructions}
              placeholder="Describe how to prepare this recipe..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              className="p-3 bg-surface border border-border rounded-lg text-foreground text-base"
            />
          </View>

          {/* Servings */}
          <View className="gap-2">
            <Text className="text-lg font-bold text-foreground">Default Servings</Text>
            <TextInput
              value={servings}
              onChangeText={setServings}
              placeholder="4"
              placeholderTextColor="#999"
              keyboardType="numeric"
              className="p-3 bg-surface border border-border rounded-lg text-foreground text-base"
            />
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            style={({ pressed }) => [
              { transform: [{ scale: pressed && !isSaving ? 0.97 : 1 }] },
              { opacity: pressed && !isSaving ? 0.8 : 1 },
            ]}
            className="mt-4 p-4 bg-primary rounded-lg items-center"
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="font-bold text-white text-lg">Save Changes</Text>
            )}
          </Pressable>

          {/* Spacing */}
          <View className="h-4" />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
