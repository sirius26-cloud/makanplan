import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe, WeeklyPlan, AppSettings, PantryStaple, MealHistoryEntry, DietaryRestriction } from './types';

const RECIPES_KEY = 'makanplan_recipes';
const WEEKLY_PLAN_KEY = 'makanplan_weekly_plan';
const SETTINGS_KEY = 'makanplan_settings';

// Default pantry staples (common in Singapore kitchens)
const DEFAULT_PANTRY_STAPLES: PantryStaple[] = [
  { id: '1', name: 'soy sauce', isActive: true },
  { id: '2', name: 'garlic', isActive: true },
  { id: '3', name: 'rice', isActive: true },
  { id: '4', name: 'oil', isActive: true },
  { id: '5', name: 'salt', isActive: true },
  { id: '6', name: 'pepper', isActive: true },
  { id: '7', name: 'sugar', isActive: true },
  { id: '8', name: 'ginger', isActive: true },
  { id: '9', name: 'onion', isActive: true },
  { id: '10', name: 'fish sauce', isActive: true },
];

const DEFAULT_SETTINGS: AppSettings = {
  defaultServings: 4,
  pantryStaples: DEFAULT_PANTRY_STAPLES,
  mealHistory: [],
  dietaryRestrictions: [],
  mealHistoryDays: 30,
};

// Recipe storage
export async function loadRecipes(): Promise<Recipe[]> {
  try {
    const data = await AsyncStorage.getItem(RECIPES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load recipes:', error);
    return [];
  }
}

export async function saveRecipes(recipes: Recipe[]): Promise<void> {
  try {
    await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
  } catch (error) {
    console.error('Failed to save recipes:', error);
  }
}

export async function addRecipe(recipe: Recipe): Promise<void> {
  const recipes = await loadRecipes();
  recipes.push(recipe);
  await saveRecipes(recipes);
}

export async function updateRecipe(recipe: Recipe): Promise<void> {
  const recipes = await loadRecipes();
  const index = recipes.findIndex((r) => r.id === recipe.id);
  if (index !== -1) {
    recipes[index] = recipe;
    await saveRecipes(recipes);
  }
}

export async function deleteRecipe(id: string): Promise<void> {
  const recipes = await loadRecipes();
  const filtered = recipes.filter((r) => r.id !== id);
  await saveRecipes(filtered);
}

// Weekly plan storage
export async function loadWeeklyPlan(): Promise<WeeklyPlan | null> {
  try {
    const data = await AsyncStorage.getItem(WEEKLY_PLAN_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load weekly plan:', error);
    return null;
  }
}

export async function saveWeeklyPlan(plan: WeeklyPlan): Promise<void> {
  try {
    await AsyncStorage.setItem(WEEKLY_PLAN_KEY, JSON.stringify(plan));
  } catch (error) {
    console.error('Failed to save weekly plan:', error);
  }
}

// Settings storage
export async function loadSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

export async function updatePantryStaples(staples: PantryStaple[]): Promise<void> {
  const settings = await loadSettings();
  settings.pantryStaples = staples;
  await saveSettings(settings);
}

// Meal history operations
export async function addMealHistory(entry: MealHistoryEntry): Promise<void> {
  const settings = await loadSettings();
  settings.mealHistory = settings.mealHistory || [];
  settings.mealHistory.push(entry);
  // Keep only last 90 days of history
  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  settings.mealHistory = settings.mealHistory.filter((e) => e.dateServed > ninetyDaysAgo);
  await saveSettings(settings);
}

export async function getMealHistory(): Promise<MealHistoryEntry[]> {
  const settings = await loadSettings();
  return settings.mealHistory || [];
}

// Dietary restrictions operations
export async function updateDietaryRestrictions(restrictions: DietaryRestriction[]): Promise<void> {
  const settings = await loadSettings();
  settings.dietaryRestrictions = restrictions;
  await saveSettings(settings);
}

export async function getDietaryRestrictions(): Promise<DietaryRestriction[]> {
  const settings = await loadSettings();
  return settings.dietaryRestrictions || [];
}
