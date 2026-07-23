import { ScrollView, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useRecipes } from '@/lib/RecipeContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { generateWeeklyPlan } from '@/lib/mealGenerator';
import { ProteinType } from '@/lib/types';
import * as Haptics from 'expo-haptics';

const PROTEIN_OPTIONS: ProteinType[] = ['chicken', 'fish', 'beef', 'seafood', 'tofu', 'mixed'];

export default function WeeklyGeneratorScreen() {
  const { recipes, setWeeklyPlan } = useRecipes();
  const router = useRouter();
  const [peopleCount, setPeopleCount] = useState(4);
  const [numDays, setNumDays] = useState(5);
  const [proteinFilter, setProteinFilter] = useState<ProteinType | undefined>(undefined);
  const [includeRiceDays, setIncludeRiceDays] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePlan = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsGenerating(true);

      const plan = generateWeeklyPlan(recipes, peopleCount, numDays, proteinFilter, includeRiceDays);
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
              <Text className="text-lg text-primary font-semibold">← Back</Text>
            </Pressable>
            <Text className="text-2xl font-bold text-foreground">Generate Weekly Plan</Text>
          </View>

          {/* People Count */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">People Count</Text>
            <View className="flex-row gap-2">
              {[1, 2, 3, 4].map((count) => (
                <Pressable
                  key={count}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setPeopleCount(count);
                  }}
                  style={({ pressed }) => [
                    { transform: [{ scale: pressed ? 0.95 : 1 }] },
                  ]}
                  className={`flex-1 py-3 rounded-lg items-center ${
                    peopleCount === count ? 'bg-primary' : 'bg-surface border border-border'
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      peopleCount === count ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {count}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Number of Days */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Number of Days</Text>
            <View className="flex-row gap-2">
              {[5, 6, 7].map((days) => (
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
                    className={`font-semibold ${
                      numDays === days ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {days}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Protein Filter */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Protein Preference (Optional)</Text>
            <View className="flex-row flex-wrap gap-2">
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setProteinFilter(undefined);
                }}
                style={({ pressed }) => [
                  { transform: [{ scale: pressed ? 0.95 : 1 }] },
                ]}
                className={`px-4 py-2 rounded-full ${
                  proteinFilter === undefined ? 'bg-primary' : 'bg-surface border border-border'
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    proteinFilter === undefined ? 'text-white' : 'text-foreground'
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
                    setProteinFilter(protein);
                  }}
                  style={({ pressed }) => [
                    { transform: [{ scale: pressed ? 0.95 : 1 }] },
                  ]}
                  className={`px-4 py-2 rounded-full ${
                    proteinFilter === protein ? 'bg-primary' : 'bg-surface border border-border'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold capitalize ${
                      proteinFilter === protein ? 'text-white' : 'text-foreground'
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
              <Text className="text-sm font-semibold text-foreground">Include Rice/Noodle Days</Text>
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
                <Text className={`font-semibold ${includeRiceDays ? 'text-white' : 'text-foreground'}`}>
                  {includeRiceDays ? 'Yes' : 'No'}
                </Text>
              </Pressable>
            </View>
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
              <Text className="font-semibold text-white text-base">Generate Plan</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
