import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Recipe, WeeklyPlan, AppSettings, MealHistoryEntry, DietaryRestriction } from './types';
import { loadRecipes, saveRecipes, loadWeeklyPlan, saveWeeklyPlan, loadSettings, saveSettings, addMealHistory, getMealHistory, updateDietaryRestrictions, getDietaryRestrictions } from './storage';
import { USER_RECIPES } from './userRecipes';
import { SEED_RECIPES } from './seedRecipes';
import { FAMILY_FAVOURITE_RECIPES, SIMILAR_DISHES } from './familyFavourites';
import { FAMILY_RECIPES } from './familyRecipes';
import { isSyncConfigured, recordDeletions, syncRecipes, getLastSync } from './sync';

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

  // Cross-device sync (master recipe library)
  syncStatus: 'off' | 'syncing' | 'ok' | 'error';
  syncMessage: string;
  lastSynced: number | null;
  syncNow: () => Promise<boolean>;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export function RecipeProvider({ children }: { children: React.ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [weeklyPlan, setWeeklyPlanState] = useState<WeeklyPlan | null>(null);
  const [settings, setSettingsState] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'off' | 'syncing' | 'ok' | 'error'>('off');
  const [syncMessage, setSyncMessage] = useState('');
  const [lastSynced, setLastSynced] = useState<number | null>(null);
  const recipesRef = useRef<Recipe[]>([]);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    recipesRef.current = recipes;
  }, [recipes]);

  // Merge this device with the master library. Never deletes anything by itself.
  const runSync = useCallback(async (base?: Recipe[]): Promise<boolean> => {
    try {
      if (!(await isSyncConfigured())) {
        setSyncStatus('off');
        return false;
      }
      setSyncStatus('syncing');
      const merged = await syncRecipes(base ?? recipesRef.current);
      recipesRef.current = merged;
      setRecipes(merged);
      await saveRecipes(merged);
      setLastSynced(await getLastSync());
      setSyncStatus('ok');
      setSyncMessage(`${merged.length} recipes in sync`);
      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      setSyncMessage(error instanceof Error ? error.message : 'Sync failed');
      return false;
    }
  }, []);

  function scheduleSync() {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      void runSync();
    }, 1500);
  }

  async function loadData() {
    try {
      setIsLoading(true);
      const [loadedRecipes, loadedPlan, loadedSettings] = await Promise.all([
        loadRecipes(),
        loadWeeklyPlan(),
        loadSettings(),
      ]);

      // If no recipes, seed with user's 44 curated recipes
      if (loadedRecipes.length === 0) {
        await saveRecipes(USER_RECIPES);
        setRecipes(USER_RECIPES);
      } else {
        // Use existing recipes (don't reset on every publish)
        setRecipes(loadedRecipes);
      }

      setWeeklyPlanState(loadedPlan);
      setSettingsState(loadedSettings);
      setLastSynced(await getLastSync());
      // Sync in the background; the app is already usable with local data.
      void (async () => {
        const current = loadedRecipes.length === 0 ? USER_RECIPES : loadedRecipes;
        recipesRef.current = current;
        const last = await getLastSync();
        if (!last || Date.now() - last > 60_000) await runSync(current);
      })();
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function addRecipe(recipe: Recipe) {
    const stamped = { ...recipe, updatedAt: Date.now() };
    const updated = [...recipes, stamped];
    setRecipes(updated);
    recipesRef.current = updated;
    await saveRecipes(updated);
    scheduleSync();
  }

  async function updateRecipe(recipe: Recipe) {
    const stamped = { ...recipe, updatedAt: Date.now() };
    const updated = recipes.map((r) => (r.id === recipe.id ? stamped : r));
    setRecipes(updated);
    recipesRef.current = updated;
    await saveRecipes(updated);
    scheduleSync();
  }

  async function deleteRecipe(id: string) {
    const updated = recipes.filter((r) => r.id !== id);
    setRecipes(updated);
    recipesRef.current = updated;
    await saveRecipes(updated);
    await recordDeletions([id]);
    scheduleSync();
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
    // Recipes dropped by a restore are recorded as deletions so they don't
    // reappear from the master library.
    const keep = new Set(newRecipes.map((r) => r.id));
    await recordDeletions(recipes.filter((r) => !keep.has(r.id)).map((r) => r.id));
    setRecipes(newRecipes);
    recipesRef.current = newRecipes;
    await saveRecipes(newRecipes);
    scheduleSync();
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

    const mergedRecipes = [...recipes, ...newRecipes.map((r) => ({ ...r, updatedAt: Date.now() }))];
    setRecipes(mergedRecipes);
    recipesRef.current = mergedRecipes;
    await saveRecipes(mergedRecipes);
    scheduleSync();

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
    syncStatus,
    syncMessage,
    lastSynced,
    syncNow: () => runSync(),
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
