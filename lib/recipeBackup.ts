import { Recipe } from './types';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

/**
 * Export all recipes as JSON file
 */
export async function exportRecipesAsJSON(recipes: Recipe[]): Promise<void> {
  try {
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `MakanPlan_Recipes_${timestamp}.json`;
    const filepath = `${FileSystem.documentDirectory}${filename}`;

    // Create JSON with metadata
    const backup = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      recipeCount: recipes.length,
      recipes: recipes,
    };

    // Write to file
    await FileSystem.writeAsStringAsync(filepath, JSON.stringify(backup, null, 2));

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filepath, {
        mimeType: 'application/json',
        dialogTitle: 'Export MakanPlan Recipes',
        UTI: 'com.example.json',
      });
    } else {
      throw new Error('Sharing is not available on this device');
    }
  } catch (error) {
    console.error('Failed to export recipes:', error);
    throw error;
  }
}

/**
 * Import recipes from JSON file
 */
export async function importRecipesFromJSON(jsonString: string): Promise<Recipe[]> {
  try {
    const backup = JSON.parse(jsonString);

    // Validate backup format
    if (!backup.recipes || !Array.isArray(backup.recipes)) {
      throw new Error('Invalid backup format: missing recipes array');
    }

    // Validate each recipe has required fields
    const recipes = backup.recipes.map((recipe: any) => {
      if (!recipe.id || !recipe.name || !recipe.ingredients || !recipe.instructions) {
        throw new Error(`Invalid recipe format: ${recipe.name || 'unknown'}`);
      }
      return recipe as Recipe;
    });

    return recipes;
  } catch (error) {
    console.error('Failed to import recipes:', error);
    throw error;
  }
}

/**
 * Create a backup file URI for sharing
 */
export async function createBackupFile(recipes: Recipe[]): Promise<string> {
  try {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `MakanPlan_Recipes_${timestamp}.json`;
    const filepath = `${FileSystem.documentDirectory}${filename}`;

    const backup = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      recipeCount: recipes.length,
      recipes: recipes,
    };

    await FileSystem.writeAsStringAsync(filepath, JSON.stringify(backup, null, 2));
    return filepath;
  } catch (error) {
    console.error('Failed to create backup file:', error);
    throw error;
  }
}

/**
 * Get backup file from device storage
 */
export async function readBackupFile(uri: string): Promise<string> {
  try {
    const content = await FileSystem.readAsStringAsync(uri);
    return content;
  } catch (error) {
    console.error('Failed to read backup file:', error);
    throw error;
  }
}
