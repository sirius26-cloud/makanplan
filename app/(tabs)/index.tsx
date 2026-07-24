import { ScrollView, Text, View, Pressable, ActivityIndicator, FlatList } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useRecipes } from '@/lib/RecipeContext';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { WeeklyPlan } from '@/lib/types';
import * as Haptics from 'expo-haptics';

// Category colors
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  protein_main: { bg: '#FFE5D9', text: '#E85D2A', border: '#E85D2A' },
  veg_side: { bg: '#D4E8D4', text: '#2D5016', border: '#2D5016' },
  rice_noodle_one_pot: { bg: '#FFF4D9', text: '#F39C12', border: '#F39C12' },
};

function getCategoryColor(type: string) {
  return CATEGORY_COLORS[type] || { bg: '#F5F5F5', text: '#7F8C8D', border: '#E5E5E5' };
}

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
        <Text className="mt-4 text-muted text-lg">Loading recipes...</Text>
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
        <View className="p-4 gap-6">
          {/* Header */}
          <View className="gap-1">
            <Text className="text-4xl font-bold text-foreground">MakanPlan</Text>
            <Text className="text-base text-muted">Weekly dinner planning made easy</Text>
          </View>

          {/* Weekly Plan Section */}
          {plan ? (
            <View className="gap-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-foreground">This Week's Meals</Text>
                <Pressable
                  onPress={handleGenerateWeek}
                  style={({ pressed }) => [
                    { transform: [{ scale: pressed ? 0.97 : 1 }] },
                    { opacity: pressed ? 0.8 : 1 },
                  ]}
                  className="px-4 py-2 rounded-full bg-primary"
                >
                  <Text className="text-sm font-bold text-white">New Week</Text>
                </Pressable>
              </View>

              {/* Meal Days */}
              <FlatList
                data={plan.days}
                keyExtractor={(item) => `day_${item.day}`}
                scrollEnabled={false}
                renderItem={({ item, index }) => {
                  const mainColor = getCategoryColor(item.main.type);
                  const vegColor = item.vegSide ? getCategoryColor(item.vegSide.type) : null;

                  return (
                    <Pressable
                      onPress={() => handleDayPress(index)}
                      style={({ pressed }) => [
                        { transform: [{ scale: pressed ? 0.98 : 1 }] },
                        { opacity: pressed ? 0.7 : 1 },
                      ]}
                      className="mb-4 p-4 bg-surface rounded-lg border border-border"
                    >
                      <View className="gap-4">
                        <Text className="text-base font-bold text-muted">
                          Day {item.day}
                        </Text>

                        {/* Main */}
                        <View
                          className="p-3 rounded-lg border-2 gap-2"
                          style={{
                            backgroundColor: mainColor.bg,
                            borderColor: mainColor.border,
                          }}
                        >
                          <Text
                            className="text-xs font-bold"
                            style={{ color: mainColor.text }}
                          >
                            MAIN
                          </Text>
                          <Text
                            className="text-lg font-bold"
                            style={{ color: mainColor.text }}
                          >
                            {item.main.name}
                          </Text>
                        </View>

                        {/* Veg Side */}
                        {item.vegSide && vegColor && (
                          <View
                            className="p-3 rounded-lg border-2 gap-2"
                            style={{
                              backgroundColor: vegColor.bg,
                              borderColor: vegColor.border,
                            }}
                          >
                            <Text
                              className="text-xs font-bold"
                              style={{ color: vegColor.text }}
                            >
                              VEG SIDE
                            </Text>
                            <Text
                              className="text-lg font-bold"
                              style={{ color: vegColor.text }}
                            >
                              {item.vegSide.name}
                            </Text>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  );
                }}
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
                  <Text className="font-bold text-white text-lg">View Grocery List</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View className="flex-1 items-center justify-center gap-4 py-12">
              <Text className="text-2xl font-bold text-foreground text-center">
                No weekly plan yet
              </Text>
              <Text className="text-base text-muted text-center">
                Generate your first week's meal plan to get started
              </Text>
              <Pressable
                onPress={handleGenerateWeek}
                style={({ pressed }) => [
                  { transform: [{ scale: pressed ? 0.97 : 1 }] },
                  { opacity: pressed ? 0.8 : 1 },
                ]}
                className="px-8 py-4 bg-primary rounded-full"
              >
                <Text className="font-bold text-white text-lg">Generate Week</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
