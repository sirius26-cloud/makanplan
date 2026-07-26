import React, { createContext, useContext, useEffect, useState } from 'react';
import { Recipe, WeeklyPlan, AppSettings, MealHistoryEntry, DietaryRestriction } from './types';
import { loadRecipes, saveRecipes, loadWeeklyPlan, saveWeeklyPlan, loadSettings, saveSettings, addMealHistory, getMealHistory, updateDietaryRestrictions, getDietaryRestrictions } from './storage';
import { SEED_RECIPES } from './seedRecipes';
import { FAMILY_FAVOURITE_RECIPES, SIMILAR_DISHES } from './familyFavourites';
import { FAMILY_RECIPES } from './familyRecipes';

interface RecipeContextType {
  recipes: Recipe[];
  weeklyPlan: WeeklyPlan | null;
  settings: AppSettings;
  isLoading: boolean;

  // Recipe operations
  addRecipe: (recipe: Recipe) => Promise<void>;
  updateRecipe: (recipe: Recipe) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  toggleFavourite: (id: string) => Promise<void>;
  toggleStaple: (id: string) => Promise<void>;
  getSimilarDishes: (recipeId: string) => Recipe[];
  replaceAllRecipes: (recipes: Recipe[]) => Promise<number>;
  mergeImportedRecipes: (recipes: Recipe[]) => Promise<{ added: number; skipped: number }>;

  // Weekly plan operations
  setWeeklyPlan: (plan: WeeklyPlan | null) => Promise<void>;

  // Settings operations
  updateSettings: (settings: AppSettings) => Promise<void>;

  // Meal history operations
  addMealToHistory: (recipeId: string, recipeName: string) => Promise<void>;
  getMealHistoryRecently: (days: number) => string[]; // Returns recently served recipe IDs

  // Dietary filter operations
  updateDietaryFilters: (restrictions: DietaryRestriction[]) => Promise<void>;
  getDietaryFilters: () => DietaryRestriction[];
  isRecipeAllowed: (recipe: Recipe) => boolean; // Check if recipe matches dietary restrictions

  // Reload data
  reload: () => Promise<void>;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export function RecipeProvider({ children }: { children: React.ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [weeklyPlan, setWeeklyPlanState] = useState<WeeklyPlan | null>(null);
  const [settings, setSettingsState] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      const [loadedRecipes, loadedPlan, loadedSettings] = await Promise.all([
        loadRecipes(),
        loadWeeklyPlan(),
        loadSettings(),
      ]);

      // If no recipes, seed with defaults (family recipes + family favourites + general recipes)
      if (loadedRecipes.length === 0) {
        const allRecipes = [...FAMILY_RECIPES, ...FAMILY_FAVOURITE_RECIPES, ...SEED_RECIPES];
        await saveRecipes(allRecipes);
        setRecipes(allRecipes);
      } else {
        // Merge any new family favourites with existing recipes
        const existingIds = new Set(loadedRecipes.map((r) => r.id));
        const newFavourites = FAMILY_FAVOURITE_RECIPES.filter((r) => !existingIds.has(r.id));
        const mergedRecipes = [...newFavourites, ...loadedRecipes];
        setRecipes(mergedRecipes);
      }

      setWeeklyPlanState(loadedPlan);
      setSettingsState(loadedSettings);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function addRecipe(recipe: Recipe) {
    const updated = [...recipes, recipe];
    setRecipes(updated);
    await saveRecipes(updated);
  }

  async function updateRecipe(recipe: Recipe) {
    const updated = recipes.map((r) => (r.id === recipe.id ? recipe : r));
    setRecipes(updated);
    await saveRecipes(updated);
  }

  async function deleteRecipe(id: string) {
    const updated = recipes.filter((r) => r.id !== id);
    setRecipes(updated);
    await saveRecipes(updated);
  }

  async function toggleFavourite(id: string) {
    const recipe = recipes.find((r) => r.id === id);
    if (recipe) {
      await updateRecipe({ ...recipe, isFavourite: !recipe.isFavourite });
    }
  }

  async function toggleStaple(id: string) {
    const recipe = recipes.find((r) => r.id === id);
    if (recipe) {
      await updateRecipe({ ...recipe, isStaple: !recipe.isStaple });
    }
  }

  function getSimilarDishes(recipeId: string): Recipe[] {
    const similarIds = SIMILAR_DISHES[recipeId] || [];
    return recipes.filter((r) => similarIds.includes(r.id));
  }

  async function replaceAllRecipes(newRecipes: Recipe[]): Promise<number> {
    setRecipes(newRecipes);
    await saveRecipes(newRecipes);
    return newRecipes.length;
  }

  async function mergeImportedRecipes(importedRecipes: Recipe[]): Promise<{ added: number; skipped: number }> {
    const existingIds = new Set(recipes.map((r) => r.id));
    const existingNames = new Set(recipes.map((r) => r.name.toLowerCase()));

    let added = 0;
    let skipped = 0;
    const newRecipes: Recipe[] = [];

    for (const recipe of importedRecipes) {
      if (existingIds.has(recipe.id) || existingNames.has(recipe.name.toLowerCase())) {
        skipped++;
      } else {
        newRecipes.push(recipe);
        existingIds.add(recipe.id);
        existingNames.add(recipe.name.toLowerCase());
        added++;
      }
    }

    const mergedRecipes = [...recipes, ...newRecipes];
    setRecipes(mergedRecipes);
    await saveRecipes(mergedRecipes);

    return { added, skipped };
  }

  async function setWeeklyPlan(plan: WeeklyPlan | null) {
    setWeeklyPlanState(plan);
    if (plan) {
      await saveWeeklyPlan(plan);
    }
  }

  async function updateSettings(newSettings: AppSettings) {
    setSettingsState(newSettings);
    await saveSettings(newSettings);
  }

  async function addMealToHistory(recipeId: string, recipeName: string) {
    const entry: MealHistoryEntry = {
      recipeId,
      recipeName,
      dateServed: Date.now(),
    };
    await addMealHistory(entry);
    await loadData();
  }

  function getMealHistoryRecently(days: number): string[] {
    if (!settings?.mealHistory) return [];
    const cutoffDate = Date.now() - days * 24 * 60 * 60 * 1000;
    return settings.mealHistory
      .filter((entry) => entry.dateServed > cutoffDate)
      .map((entry) => entry.recipeId);
  }

  async function updateDietaryFilters(restrictions: DietaryRestriction[]) {
    await updateDietaryRestrictions(restrictions);
    if (settings) {
      settings.dietaryRestrictions = restrictions;
      setSettingsState(settings);
    }
  }

  function getDietaryFilters(): DietaryRestriction[] {
    return settings?.dietaryRestrictions || [];
  }

  function isRecipeAllowed(recipe: Recipe): boolean {
    const activeRestrictions = getDietaryFilters().filter((r) => r.isActive);
    if (activeRestrictions.length === 0) return true;

    for (const restriction of activeRestrictions) {
      const restrictionName = restriction.name.toLowerCase();
      if (restrictionName.includes('pork') && recipe.protein === 'chicken') return true;
      if (restrictionName.includes('beef') && recipe.protein === 'beef') return false;
      if (restrictionName.includes('shellfish') && recipe.protein === 'seafood') return false;
      if (restrictionName.includes('fish') && recipe.protein === 'fish') return false;
      if (restrictionName.includes('chicken') && recipe.protein === 'chicken') return false;
      if (restrictionName.includes('tofu') && recipe.protein === 'tofu') return false;
    }
    return true;
  }

  async function reload() {
    await loadData();
  }

  const value: RecipeContextType = {
    recipes,
    weeklyPlan,
    settings: settings || { defaultServings: 4, pantryStaples: [], mealHistory: [], dietaryRestrictions: [], mealHistoryDays: 30 },
    isLoading,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    toggleFavourite,
    toggleStaple,
    getSimilarDishes,
    replaceAllRecipes,
    mergeImportedRecipes,
    setWeeklyPlan,
    updateSettings,
    addMealToHistory,
    getMealHistoryRecently,
    updateDietaryFilters,
    getDietaryFilters,
    isRecipeAllowed,
    reload,
  };

  return <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>;
}

export function useRecipes() {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipes must be used within RecipeProvider');
  }
  return context;
}
