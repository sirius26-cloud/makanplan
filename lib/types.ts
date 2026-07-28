/**
 * Recipe and meal planning types for MakanPlan
 */

export type RecipeType = 'protein_main' | 'veg_side' | 'rice_noodle_one_pot';
export type ProteinType = 'chicken' | 'fish' | 'beef' | 'seafood' | 'tofu';

export interface Recipe {
  id: string;
  name: string;
  type: RecipeType;
  protein: ProteinType;
  hasVeg: boolean; // Already includes a veg component
  isRice: boolean; // Rice-based one-pot (vs noodle/soup)
  isFavourite: boolean;
  isStaple: boolean;
  ingredients: string[]; // Ingredient names with quantities
  instructions: string;
  servings: number; // Default servings
  cuisineType: 'Japanese' | 'Thai' | 'Cantonese' | 'Vietnamese' | 'Western' | 'Mixed' | 'Taiwanese';
  spiceLevel: 'light' | 'light-medium' | 'medium'; // User prefers light/clean dinners
  createdAt: number; // Timestamp
}

export interface MealDay {
  day: number; // 1-7
  main: Recipe;
  vegSide: Recipe | null; // Null if main already has veg
  format: 'one-pot' | 'main-veg'; // Explicit format toggle
}

export interface WeeklyPlan {
  id: string;
  createdAt: number;
  peopleCount: number;
  days: MealDay[];
  proteinFilters?: ProteinType[]; // Multiple protein filters
  includeRiceDays: boolean;
}

export interface GroceryItem {
  id: string;
  name: string; // Normalized ingredient name
  category: 'Protein' | 'Veg' | 'Pantry' | 'Other';
  isChecked: boolean;
  quantity?: string; // Optional for display
}

export interface PantryStaple {
  id: string;
  name: string;
  isActive: boolean;
}

export interface MealHistoryEntry {
  recipeId: string;
  recipeName: string;
  dateServed: number; // Timestamp
  dayOfWeek?: number; // 1-7 for tracking which day of week
}

export interface DietaryRestriction {
  id: string;
  name: string; // e.g., 'no pork', 'no shellfish', 'no beef'
  isActive: boolean;
}

export interface AppSettings {
  defaultServings: number; // 1-4, default 4
  pantryStaples: PantryStaple[];
  mealHistory: MealHistoryEntry[]; // Track recently served meals
  dietaryRestrictions: DietaryRestriction[]; // Dietary filters
  mealHistoryDays: number; // How many days to avoid repeating meals (default 30)
}
