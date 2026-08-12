import { ScrollView, Text, View, Pressable, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useRecipes } from '@/lib/RecipeContext';
import { useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { ProteinType, RecipeType } from '@/lib/types';
import * as Haptics from 'expo-haptics';
import { RecipePhotoView } from '@/components/recipe-photo';

const PROTEIN_OPTIONS: ProteinType[] = ['chicken', 'fish', 'beef', 'seafood', 'tofu'];
const RECIPE_TYPES: RecipeType[] = ['protein_main', 'veg_side', 'rice_noodle_one_pot'];

export default function RecipesScreen() {
  const { recipes, isLoading, toggleFavourite, toggleStaple } = useRecipes();
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [selectedProtein, setSelectedProtein] = useState<ProteinType | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<RecipeType | undefined>(undefined);

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesSearch = recipe.name.toLowerCase().includes(searchText.toLowerCase());
      const matchesProtein = !selectedProtein || recipe.protein === selectedProtein;
      const matchesType = !selectedType || recipe.type === selectedType;
      return matchesSearch && matchesProtein && matchesType;
    });
  }, [recipes, searchText, selectedProtein, selectedType]);

  const handleRecipePress = (recipeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/recipe-detail' as any,
      params: { recipeId },
    });
  };

  const handleToggleFavourite = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavourite(id);
  };

  const handleToggleStaple = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleStaple(id);
  };

  if (isLoading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#E85D2A" />
        <Text className="mt-4 text-muted">Loading recipes...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="p-4 gap-4">
          {/* Header */}
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold text-foreground">Recipe Library</Text>
                <Text className="text-sm text-muted">{filteredRecipes.length} recipes</Text>
              </View>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/add-recipe' as any);
                }}
                style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.95 : 1 }] }]}
                className="px-3 py-2 bg-primary rounded-lg"
              >
                <Text className="text-white font-bold text-lg">+ Add</Text>
              </Pressable>
            </View>
          </View>

          {/* Search */}
          <TextInput
            placeholder="Search recipes..."
            placeholderTextColor="#9BA1A6"
            value={searchText}
            onChangeText={setSearchText}
            className="p-3 bg-surface border border-border rounded-lg text-foreground"
          />

          {/* Type Filter */}
          <View className="gap-2">
            <Text className="text-xs font-semibold text-muted">Recipe Type</Text>
            <View className="flex-row flex-wrap gap-2">
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedType(undefined);
                }}
                style={({ pressed }) => [
                  { transform: [{ scale: pressed ? 0.95 : 1 }] },
                ]}
                className={`px-3 py-2 rounded-full ${
                  selectedType === undefined ? 'bg-primary' : 'bg-surface border border-border'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    selectedType === undefined ? 'text-white' : 'text-foreground'
                  }`}
                >
                  All
                </Text>
              </Pressable>
              {RECIPE_TYPES.map((type) => (
                <Pressable
                  key={type}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedType(type);
                  }}
                  style={({ pressed }) => [
                    { transform: [{ scale: pressed ? 0.95 : 1 }] },
                  ]}
                  className={`px-3 py-2 rounded-full ${
                    selectedType === type ? 'bg-primary' : 'bg-surface border border-border'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      selectedType === type ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {type === 'protein_main'
                      ? 'Main'
                      : type === 'veg_side'
                        ? 'Veg'
                        : 'Rice/Noodle'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Protein Filter */}
          <View className="gap-2">
            <Text className="text-xs font-semibold text-muted">Protein</Text>
            <View className="flex-row flex-wrap gap-2">
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedProtein(undefined);
                }}
                style={({ pressed }) => [
                  { transform: [{ scale: pressed ? 0.95 : 1 }] },
                ]}
                className={`px-3 py-2 rounded-full ${
                  selectedProtein === undefined ? 'bg-primary' : 'bg-surface border border-border'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    selectedProtein === undefined ? 'text-white' : 'text-foreground'
                  }`}
                >
                  All
                </Text>
              </Pressable>
              {PROTEIN_OPTIONS.map((protein) => (
                <Pressable
                  key={protein}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedProtein(protein);
                  }}
                  style={({ pressed }) => [
                    { transform: [{ scale: pressed ? 0.95 : 1 }] },
                  ]}
                  className={`px-3 py-2 rounded-full ${
                    selectedProtein === protein ? 'bg-primary' : 'bg-surface border border-border'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold capitalize ${
                      selectedProtein === protein ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {protein}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Recipes List */}
          <FlatList
            data={filteredRecipes}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleRecipePress(item.id)}
                style={({ pressed }) => [
                  { transform: [{ scale: pressed ? 0.98 : 1 }] },
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                className="mb-3 p-4 bg-surface rounded-lg border border-border"
              >
                <View className="flex-row gap-3">
                  <RecipePhotoView photo={item.photo} variant="thumbnail" />
                  <View className="flex-1 gap-2">
                    <View className="flex-row items-center justify-between">
                      <Text className="flex-1 text-base font-semibold text-foreground">
                        {item.name}
                      </Text>
                      <View className="flex-row gap-1">
                        <Pressable
                          onPress={() => handleToggleFavourite(item.id)}
                          style={({ pressed }) => [
                            { transform: [{ scale: pressed ? 0.9 : 1 }] },
                          ]}
                        >
                          <Text className="text-lg">{item.isFavourite ? '❤️' : '🤍'}</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => handleToggleStaple(item.id)}
                          style={({ pressed }) => [
                            { transform: [{ scale: pressed ? 0.9 : 1 }] },
                          ]}
                        >
                          <Text className="text-lg">{item.isStaple ? '⭐' : '☆'}</Text>
                        </Pressable>
                      </View>
                    </View>

                    <View className="flex-row gap-2 flex-wrap">
                      <Text className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                        {item.type === 'protein_main'
                          ? 'Main'
                          : item.type === 'veg_side'
                            ? 'Veg'
                            : 'Rice/Noodle'}
                      </Text>
                      <Text className="text-xs bg-primary/20 text-primary px-2 py-1 rounded capitalize">
                        {item.protein}
                      </Text>
                      <Text className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                        {item.cuisineType}
                      </Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            )}
          />

          {filteredRecipes.length === 0 && (
            <View className="items-center justify-center py-12">
              <Text className="text-muted">No recipes found</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
