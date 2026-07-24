import { Recipe, WeeklyPlan, GroceryItem, PantryStaple } from './types';

/**
 * Extract pure ingredient from text that may contain preparation steps
 * Removes common preparation descriptors and instructions
 */
function extractPureIngredient(ingredient: string): string {
  let cleaned = ingredient
    .toLowerCase()
    .trim()
    // Remove preparation methods
    .replace(/\b(chopped|sliced|diced|minced|grated|peeled|halved|whole|fresh|dried|ground|powdered|crushed|finely|coarsely|blanched|roasted|grilled|fried|boiled|steamed|sautéed|pan-fried|deep-fried|shallow-fried|stir-fried|braised|stewed|simmered|baked|toasted|marinated|seasoned|coated|mixed|blended|pureed|mashed|shredded|julienned|brunoise|chiffonade)\b/gi, '')
    // Remove common instruction phrases
    .replace(/\b(add|mix|combine|stir|fold|whisk|beat|blend|process|heat|cook|bake|fry|boil|steam|roast|grill|simmer|braise|stew|sauté|season|taste|adjust|serve|garnish|top|sprinkle|drizzle|pour|spread|layer|arrange|place|set aside|keep|store|refrigerate|freeze|thaw|let|allow|until|when|if|as|then|before|after|while|during)\b/gi, '')
    // Remove common quantity descriptors
    .replace(/\b(tbsp|tsp|cup|cups|oz|lb|lbs|g|kg|ml|l|pinch|dash|splash|handful|piece|pieces|slice|slices|stalk|stalks|clove|cloves|head|heads|bunch|bunches|can|cans|jar|jars|bottle|bottles|package|packages|pkt|pkts|approx|approximately|about|roughly|around|or so)\b/gi, '')
    // Remove numbers and measurements
    .replace(/\d+[\d.\/]*\s*-?\s*\d*\s*/g, '')
    // Remove parenthetical content (often contains instructions)
    .replace(/\([^)]*\)/g, '')
    // Remove special characters and extra whitespace
    .replace(/[&,;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // If result is empty or too short, return original cleaned version
  if (cleaned.length < 2) {
    return ingredient
      .toLowerCase()
      .trim()
      .replace(/\d+[\d.\/]*\s*-?\s*\d*\s*/g, '')
      .replace(/\([^)]*\)/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return cleaned;
}

/**
 * Normalize ingredient name by removing prep descriptors
 */
function normalizeIngredient(ingredient: string): string {
  const pure = extractPureIngredient(ingredient);
  return pure
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Categorize ingredient into groups
 */
function categorizeIngredient(ingredient: string): 'Protein' | 'Veg' | 'Pantry' | 'Other' {
  const normalized = normalizeIngredient(ingredient).toLowerCase();

  // Protein keywords
  const proteinKeywords = ['chicken', 'fish', 'beef', 'shrimp', 'seafood', 'tofu', 'pork', 'duck', 'scallops', 'crab', 'salmon', 'tuna', 'cod', 'halibut', 'prawn'];
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
    'green onion',
    'napa',
    'bamboo',
    'celery',
    'zucchini',
    'eggplant',
    'asparagus',
    'broccoli rabe',
    'kale',
    'arugula',
    'watercress',
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
    'cornstarch',
    'flour',
    'butter',
    'wine',
    'cooking wine',
    'shaoxing',
    'huatiao',
    'lemongrass',
    'chilli',
    'lime',
    'lemon',
    'honey',
    'soy',
    'miso',
    'ponzu',
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

      // Skip empty ingredients or very short strings (likely noise)
      if (!normalized || normalized.length < 2) continue;

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

        // Skip empty ingredients or very short strings
        if (!normalized || normalized.length < 2) continue;

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
