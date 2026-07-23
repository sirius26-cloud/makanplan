import { Recipe, WeeklyPlan, GroceryItem, PantryStaple } from './types';

/**
 * Normalize ingredient name by removing prep descriptors
 */
function normalizeIngredient(ingredient: string): string {
  return ingredient
    .toLowerCase()
    .trim()
    .replace(/\b(chopped|sliced|diced|minced|grated|peeled|halved|whole|fresh|dried|ground|powdered|crushed|finely|coarsely)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Categorize ingredient into groups
 */
function categorizeIngredient(ingredient: string): 'Protein' | 'Veg' | 'Pantry' | 'Other' {
  const normalized = normalizeIngredient(ingredient).toLowerCase();

  // Protein keywords
  const proteinKeywords = ['chicken', 'fish', 'beef', 'shrimp', 'seafood', 'tofu', 'pork', 'duck', 'scallops', 'crab'];
  if (proteinKeywords.some((kw) => normalized.includes(kw))) return 'Protein';

  // Vegetable keywords
  const vegKeywords = [
    'broccoli',
    'cabbage',
    'kangkong',
    'bok choy',
    'carrot',
    'bell pepper',
    'snap pea',
    'mushroom',
    'pea',
    'bean',
    'basil',
    'spinach',
    'lettuce',
    'cucumber',
    'tomato',
    'onion',
    'garlic',
    'ginger',
    'scallion',
    'napa',
    'bamboo',
  ];
  if (vegKeywords.some((kw) => normalized.includes(kw))) return 'Veg';

  // Pantry keywords
  const pantryKeywords = [
    'soy sauce',
    'rice',
    'oil',
    'salt',
    'pepper',
    'sugar',
    'fish sauce',
    'oyster sauce',
    'mirin',
    'sake',
    'dashi',
    'noodle',
    'curry paste',
    'coconut milk',
    'peanut',
    'sesame',
    'vinegar',
    'starch',
    'flour',
    'butter',
  ];
  if (pantryKeywords.some((kw) => normalized.includes(kw))) return 'Pantry';

  return 'Other';
}

/**
 * Generate grocery list from weekly plan
 */
export function generateGroceryList(
  plan: WeeklyPlan,
  pantryStaples: PantryStaple[],
): GroceryItem[] {
  const activePantryNames = new Set(
    pantryStaples
      .filter((s) => s.isActive)
      .map((s) => normalizeIngredient(s.name)),
  );

  // Aggregate all ingredients
  const ingredientMap = new Map<string, { count: number; category: 'Protein' | 'Veg' | 'Pantry' | 'Other' }>();

  for (const mealDay of plan.days) {
    // Add main recipe ingredients
    for (const ingredient of mealDay.main.ingredients) {
      const normalized = normalizeIngredient(ingredient);

      // Skip if in pantry staples
      if (activePantryNames.has(normalized)) continue;

      const category = categorizeIngredient(ingredient);
      const existing = ingredientMap.get(normalized) || { count: 0, category };
      ingredientMap.set(normalized, { count: existing.count + 1, category });
    }

    // Add veg side ingredients if present
    if (mealDay.vegSide) {
      for (const ingredient of mealDay.vegSide.ingredients) {
        const normalized = normalizeIngredient(ingredient);

        // Skip if in pantry staples
        if (activePantryNames.has(normalized)) continue;

        const category = categorizeIngredient(ingredient);
        const existing = ingredientMap.get(normalized) || { count: 0, category };
        ingredientMap.set(normalized, { count: existing.count + 1, category });
      }
    }
  }

  // Convert to GroceryItem array, sorted by category
  const items: GroceryItem[] = Array.from(ingredientMap.entries()).map(([name, { category }], index) => ({
    id: `item_${index}`,
    name: name.charAt(0).toUpperCase() + name.slice(1),
    category,
    isChecked: false,
  }));

  // Sort by category order
  const categoryOrder = { Protein: 0, Veg: 1, Pantry: 2, Other: 3 };
  items.sort((a, b) => categoryOrder[a.category] - categoryOrder[b.category]);

  return items;
}

/**
 * Group grocery items by category for display
 */
export function groupGroceryItems(items: GroceryItem[]): Record<string, GroceryItem[]> {
  const grouped: Record<string, GroceryItem[]> = {
    Protein: [],
    Veg: [],
    Pantry: [],
    Other: [],
  };

  for (const item of items) {
    grouped[item.category].push(item);
  }

  return grouped;
}
