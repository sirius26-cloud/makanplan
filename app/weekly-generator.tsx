import { ScrollView, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useRecipes } from '@/lib/RecipeContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { generateWeeklyPlan } from '@/lib/mealGenerator';
import { ProteinType } from '@/lib/types';
import * as Haptics from 'expo-haptics';

const PROTEIN_OPTIONS: ProteinType[] = ['chicken', 'fish', 'beef', 'seafood', 'tofu'];

export default function WeeklyGeneratorScreen() {
  const { recipes, setWeeklyPlan, settings } = useRecipes();
  const router = useRouter();
  const [peopleCount, setPeopleCount] = useState(settings?.defaultServings || 4);
  const [numDays, setNumDays] = useState(5);
  const [selectedProteins, setSelectedProteins] = useState<ProteinType[]>([]);
  const [includeRiceDays, setIncludeRiceDays] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleToggleProtein = (protein: ProteinType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedProteins((prev) => {
      if (prev.includes(protein)) {
        return prev.filter((p) => p !== protein);
      } else {
        return [...prev, protein];
      }
    });
  };

  const handleGeneratePlan = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsGenerating(true);

      // If no proteins selected, use all (undefined)
      const proteinFilters = selectedProteins.length > 0 ? selectedProteins : undefined;

      const plan = generateWeeklyPlan(recipes, peopleCount, numDays, proteinFilters, includeRiceDays);
      await setWeeklyPlan(plan);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error('Failed to generate plan:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsGenerating(false);
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
            <Text className="text-3xl font-bold text-foreground">Generate Weekly Plan</Text>
            <Text className="text-base text-muted">Customize your meal plan preferences</Text>
          </View>

          {/* People Count (1-8 pax) */}
          <View className="gap-3">
            <Text className="text-lg font-bold text-foreground">Number of People (Pax)</Text>
            <View className="flex-row gap-2 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                <Pressable
                  key={count}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setPeopleCount(count);
                  }}
                  style={({ pressed }) => [
                    { transform: [{ scale: pressed ? 0.95 : 1 }] },
                  ]}
                  className={`flex-1 min-w-[45px] py-3 rounded-lg items-center ${
                    peopleCount === count ? 'bg-primary' : 'bg-surface border border-border'
                  }`}
                >
                  <Text
                    className={`font-bold text-base ${
                      peopleCount === count ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {count}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Number of Days (4-7 days) */}
          <View className="gap-3">
            <Text className="text-lg font-bold text-foreground">Number of Days to Plan</Text>
            <View className="flex-row gap-2 flex-wrap">
              {[4, 5, 6, 7].map((days) => (
                <Pressable
                  key={days}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setNumDays(days);
                  }}
                  style={({ pressed }) => [
                    { transform: [{ scale: pressed ? 0.95 : 1 }] },
                  ]}
                  className={`flex-1 py-3 rounded-lg items-center ${
                    numDays === days ? 'bg-primary' : 'bg-surface border border-border'
                  }`}
                >
                  <Text
                    className={`font-bold text-base ${
                      numDays === days ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {days} days
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Protein Preferences */}
          <View className="gap-3">
            <Text className="text-lg font-bold text-foreground">Protein Preferences (Optional)</Text>
            <Text className="text-sm text-muted">Select one or more proteins. Leave blank for all.</Text>
            <View className="flex-row flex-wrap gap-2">
              {PROTEIN_OPTIONS.map((protein) => (
                <Pressable
                  key={protein}
                  onPress={() => handleToggleProtein(protein)}
                  style={({ pressed }) => [
                    { transform: [{ scale: pressed ? 0.95 : 1 }] },
                  ]}
                  className={`px-4 py-2 rounded-full ${
                    selectedProteins.includes(protein)
                      ? 'bg-primary'
                      : 'bg-surface border border-border'
                  }`}
                >
                  <Text
                    className={`text-base font-bold capitalize ${
                      selectedProteins.includes(protein)
                        ? 'text-white'
                        : 'text-foreground'
                    }`}
                  >
                    {protein}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Include Rice Days */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-foreground">Include Rice/Noodle Days</Text>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setIncludeRiceDays(!includeRiceDays);
                }}
                style={({ pressed }) => [
                  { transform: [{ scale: pressed ? 0.95 : 1 }] },
                ]}
                className={`px-4 py-2 rounded-full ${
                  includeRiceDays ? 'bg-primary' : 'bg-surface border border-border'
                }`}
              >
                <Text className={`font-bold text-base ${includeRiceDays ? 'text-white' : 'text-foreground'}`}>
                  {includeRiceDays ? 'Yes' : 'No'}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Summary */}
          <View className="p-4 bg-surface rounded-lg border border-border gap-2">
            <Text className="text-base font-semibold text-foreground">Plan Summary</Text>
            <Text className="text-sm text-muted">
              📅 {numDays} days × {peopleCount} pax
            </Text>
            <Text className="text-sm text-muted">
              🍗 Proteins: {selectedProteins.length > 0 ? selectedProteins.join(', ') : 'All'}
            </Text>
            <Text className="text-sm text-muted">
              🍚 Rice/Noodle days: {includeRiceDays ? 'Included' : 'Excluded'}
            </Text>
          </View>

          {/* Generate Button */}
          <Pressable
            onPress={handleGeneratePlan}
            disabled={isGenerating}
            style={({ pressed }) => [
              { transform: [{ scale: pressed && !isGenerating ? 0.97 : 1 }] },
              { opacity: pressed && !isGenerating ? 0.8 : 1 },
            ]}
            className="mt-6 p-4 bg-primary rounded-lg items-center"
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="font-bold text-white text-lg">Generate Plan</Text>
            )}
          </Pressable>

          {/* Spacing */}
          <View className="h-4" />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
