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
    .replace(/\b(tbsp|tsp|cup|cups|oz|lb|lbs|g|kg|ml|l|pinch|dash|splash|handful|piece|pieces|pcs|pc|slice|slices|stalk|stalks|clove|cloves|head|heads|bunch|bunches|can|cans|jar|jars|bottle|bottles|package|packages|pkt|pkts|approx|approximately|about|roughly|around|or so|a|an)\b/gi, '')
    // Unicode vulgar fractions (½ ⅓ ⅔ ¼ ¾ ⅕ etc.) count as quantities too
    .replace(/[\u00BC-\u00BE\u2150-\u215E]/g, '')
    // Remove numbers and measurements
    .replace(/\d+[\d.\/]*\s*-?\s*\d*\s*/g, '')
    // Remove parenthetical and bracketed content (often section labels or instructions)
    .replace(/\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]/g, '')
    // Remove special characters and extra whitespace, including em/en dashes and tildes
    // used as name:quantity separators (e.g. "cornstarch — 1 tbsp", "chilli – 3 pcs")
    .replace(/[&,;:~–—]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    // Remove stray single letters at start (artifacts from quantity removal like 'g' from grams)
    .replace(/^[a-z]\s+/i, '')
    // Strip leading/trailing separator punctuation left dangling after quantity/unit removal
    // (e.g. "cornstarch —" or "~ water" once the number before/after it is gone)
    .replace(/^[\s\-–—~:]+|[\s\-–—~:]+$/g, '')
    .trim();

  // If the entry is just a bracketed label with nothing else (e.g. "[sauce]"), treat as empty
  if (/^\[[^\]]*\]$/.test(ingredient.trim())) {
    return '';
  }

  // If result is empty or too short, return original cleaned version
  if (cleaned.length < 2) {
    return ingredient
      .toLowerCase()
      .trim()
      .replace(/\d+[\d.\/]*\s*-?\s*\d*\s*/g, '')
      .replace(/\([^)]*\)/g, '')
      .replace(/\s+/g, ' ')
      .replace(/^[\s\-–—~:]+|[\s\-–—~:]+$/g, '')
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
    'kai lan',
    'nai bai',
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
    'shallot',
    'egg',
    'milk',
    'cheese',
    'yogurt',
    'cilantro',
    'coriander',
    'mint',
    'curry leaf',
    'tempeh',
    'seaweed',
    'ketchup',
    'mayo',
    'sriracha',
    'hoisin',
  ];
  if (pantryKeywords.some((kw) => normalized.includes(kw))) return 'Pantry';

  // Default to Pantry for any unmatched items
  return 'Pantry';
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
  };

  for (const item of items) {
    grouped[item.category].push(item);
  }

  return grouped;
}
