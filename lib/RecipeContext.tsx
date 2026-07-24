import React, { createContext, useContext, useEffect, useState } from 'react';
import { Recipe, WeeklyPlan, AppSettings } from './types';
import { loadRecipes, saveRecipes, loadWeeklyPlan, saveWeeklyPlan, loadSettings, saveSettings } from './storage';
import { SEED_RECIPES } from './seedRecipes';
import { FAMILY_FAVOURITE_RECIPES, SIMILAR_DISHES } from './familyFavourites';

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

  // Weekly plan operations
  setWeeklyPlan: (plan: WeeklyPlan | null) => Promise<void>;

  // Settings operations
  updateSettings: (settings: AppSettings) => Promise<void>;

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

      // If no recipes, seed with defaults (family favourites + general recipes)
      if (loadedRecipes.length === 0) {
        const allRecipes = [...FAMILY_FAVOURITE_RECIPES, ...SEED_RECIPES];
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

  async function reload() {
    await loadData();
  }

  const value: RecipeContextType = {
    recipes,
    weeklyPlan,
    settings: settings || { defaultServings: 4, pantryStaples: [] },
    isLoading,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    toggleFavourite,
    toggleStaple,
    getSimilarDishes,
    setWeeklyPlan,
    updateSettings,
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
