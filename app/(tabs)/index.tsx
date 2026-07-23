import { ScrollView, Text, View, Pressable, ActivityIndicator, FlatList } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useRecipes } from '@/lib/RecipeContext';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { WeeklyPlan } from '@/lib/types';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const { weeklyPlan, isLoading, recipes } = useRecipes();
  const router = useRouter();
  const [plan, setPlan] = useState<WeeklyPlan | null>(weeklyPlan);

  useEffect(() => {
    setPlan(weeklyPlan);
  }, [weeklyPlan]);

  if (isLoading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#E85D2A" />
        <Text className="mt-4 text-muted">Loading recipes...</Text>
      </ScreenContainer>
    );
  }

  const handleGenerateWeek = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/weekly-generator' as any);
  };

  const handleViewGroceryList = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/grocery-list' as any);
  };

  const handleDayPress = (dayIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/day-detail' as any,
      params: { dayIndex: dayIndex.toString() },
    });
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="p-4 gap-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">MakanPlan</Text>
            <Text className="text-sm text-muted">Weekly dinner planning made easy</Text>
          </View>

          {/* Weekly Plan Section */}
          {plan ? (
            <View className="gap-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-foreground">This Week's Meals</Text>
                <Pressable
                  onPress={handleGenerateWeek}
                  style={({ pressed }) => [
                    { transform: [{ scale: pressed ? 0.97 : 1 }] },
                    { opacity: pressed ? 0.8 : 1 },
                  ]}
                  className="px-3 py-2 rounded-full bg-primary"
                >
                  <Text className="text-xs font-semibold text-white">New Week</Text>
                </Pressable>
              </View>

              {/* Meal Days */}
              <FlatList
                data={plan.days}
                keyExtractor={(item) => `day_${item.day}`}
                scrollEnabled={false}
                renderItem={({ item, index }) => (
                  <Pressable
                    onPress={() => handleDayPress(index)}
                    style={({ pressed }) => [
                      { transform: [{ scale: pressed ? 0.98 : 1 }] },
                      { opacity: pressed ? 0.7 : 1 },
                    ]}
                    className="mb-3 p-4 bg-surface rounded-lg border border-border"
                  >
                    <View className="gap-3">
                      <Text className="text-sm font-semibold text-muted">
                        Day {item.day}
                      </Text>

                      {/* Main */}
                      <View className="gap-1">
                        <Text className="text-xs text-muted">Main</Text>
                        <Text className="text-base font-semibold text-foreground">
                          {item.main.name}
                        </Text>
                      </View>

                      {/* Veg Side */}
                      {item.vegSide && (
                        <View className="gap-1 pt-2 border-t border-border">
                          <Text className="text-xs text-muted">Veg Side</Text>
                          <Text className="text-base font-semibold text-foreground">
                            {item.vegSide.name}
                          </Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                )}
              />

              {/* Action Buttons */}
              <View className="gap-3 mt-4">
                <Pressable
                  onPress={handleViewGroceryList}
                  style={({ pressed }) => [
                    { transform: [{ scale: pressed ? 0.97 : 1 }] },
                    { opacity: pressed ? 0.8 : 1 },
                  ]}
                  className="p-4 bg-primary rounded-lg items-center"
                >
                  <Text className="font-semibold text-white">View Grocery List</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View className="flex-1 items-center justify-center gap-4 py-12">
              <Text className="text-lg font-semibold text-foreground text-center">
                No weekly plan yet
              </Text>
              <Text className="text-sm text-muted text-center">
                Generate your first week's meal plan to get started
              </Text>
              <Pressable
                onPress={handleGenerateWeek}
                style={({ pressed }) => [
                  { transform: [{ scale: pressed ? 0.97 : 1 }] },
                  { opacity: pressed ? 0.8 : 1 },
                ]}
                className="px-6 py-3 bg-primary rounded-full"
              >
                <Text className="font-semibold text-white">Generate Week</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
