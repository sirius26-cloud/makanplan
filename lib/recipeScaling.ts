import { Recipe } from './types';

/**
 * Scale recipe ingredients based on number of servings
 */
export function scaleRecipe(recipe: Recipe, targetServings: number): Recipe {
  const scaleFactor = targetServings / recipe.servings;

  // Scale ingredients (just multiply by factor, keep as strings)
  const scaledIngredients = recipe.ingredients.map((ingredient) => {
    // Try to extract number from ingredient
    const numberMatch = ingredient.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);

    if (numberMatch) {
      const [, quantity, rest] = numberMatch;
      const scaledQuantity = (parseFloat(quantity) * scaleFactor).toFixed(1);
      // Remove trailing .0 for whole numbers
      const cleanQuantity = scaledQuantity.endsWith('.0')
        ? scaledQuantity.slice(0, -2)
        : scaledQuantity;
      return `${cleanQuantity} ${rest}`;
    }

    // If no number found, return as-is
    return ingredient;
  });

  return {
    ...recipe,
    servings: targetServings,
    ingredients: scaledIngredients,
  };
}

/**
 * Get common serving sizes for a recipe
 */
export function getServingSizes(baseServings: number): number[] {
  const sizes = [1, 2, 3, 4, 5, 6, 8];
  // Filter to show reasonable scales (0.5x to 2x the base)
  return sizes.filter((size) => {
    const scale = size / baseServings;
    return scale >= 0.5 && scale <= 2;
  });
}

/**
 * Format scaled ingredient for display
 */
export function formatScaledIngredient(ingredient: string): string {
  // Clean up extra whitespace
  return ingredient.replace(/\s+/g, ' ').trim();
}
