import { Recipe, WeeklyPlan, GroceryItem, PantryStaple } from './types';

/**
 * Split a raw ingredient line on "/" when it's being used as an
 * alternative/either-or separator (e.g. "garlic / ginger",
 * "Coffeemate/ garlic powder", "Broccoli/ cauliflower").
 * Does NOT split numeric fractions like "1/2 cup" or "3/4 tsp".
 */
function splitAlternatives(ingredient: string): string[] {
  const parts = ingredient
    .split(/(?<!\d)\s*\/\s*(?!\d)/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [ingredient];
}

/**
 * Extract pure ingredient from text that may contain preparation steps
 * Removes common preparation descriptors and instructions
 */
function extractPureIngredient(ingredient: string): string {
  let cleaned = ingredient
    .toLowerCase()
    .trim()
    // Remove preparation methods, cut styles, and descriptors
    .replace(
      /\b(chopped|sliced|thinly|thickly|thin|thick|diced|minced|grated|peeled|halved|quartered|whole|fresh|dried|ground|powdered|crushed|finely|coarsely|blanched|roasted|grilled|fried|boiled|steamed|sautéed|pan-fried|deep-fried|shallow-fried|stir-fried|braised|stewed|simmered|baked|toasted|marinated|seasoned|coated|mixed|blended|pureed|mashed|shredded|julienned|julienne|brunoise|chiffonade|cubed|cubes|cut|into|wedges|rings|strips|chunks|triangles|rounds|matchsticks|lengthwise|crosswise|diagonally|boneless|skinless|bone-in|skin-on|deveined|shelled|unshelled|unpeeled|washed|rinsed|trimmed|cleaned|large|medium|small|baby|young|ripe|overripe|raw|cooked|extra|virgin|unsalted|salted|room-temperature|room temperature|cold|hot|warm|new|knob|inch|inches|fillet|fillets|leftover|store-bought|homemade|garnish|garnishing|garnished|serving|topping)\b/gi,
      '',
    )
    // Remove common instruction phrases and filler words
    .replace(
      /\b(add|mix|combine|stir|fold|whisk|beat|blend|process|heat|cook|bake|fry|boil|steam|roast|grill|simmer|braise|stew|sauté|season|taste|adjust|serve|top|sprinkle|drizzle|pour|spread|layer|arrange|place|set aside|keep|store|refrigerate|freeze|thaw|let|allow|until|when|if|as|then|before|after|while|during|of|the|for|to|optional|if desired|as needed|as required)\b/gi,
      '',
    )
    // Remove common quantity descriptors
    .replace(
      /\b(tbsp|tbsps|tablespoon|tablespoons|tsp|tsps|teaspoon|teaspoons|cup|cups|oz|ounce|ounces|lb|lbs|pound|pounds|g|gram|grams|kg|ml|l|litre|litres|pinch|dash|splash|handful|piece|pieces|pcs|pc|slice|slices|stalk|stalks|clove|cloves|head|heads|bunch|bunches|can|cans|jar|jars|bottle|bottles|package|packages|pkt|pkts|approx|approximately|about|roughly|around|or so|a|an)\b/gi,
      '',
    )
    // Unicode vulgar fractions (½ ⅓ ⅔ ¼ ¾ ⅕ etc.) count as quantities too
    .replace(/[¼-¾⅐-⅞]/g, '')
    // Remove numbers and measurements
    .replace(/\d+[\d.\/]*\s*-?\s*\d*\s*/g, '')
    // Remove parenthetical and bracketed content (often section labels or instructions)
    .replace(/\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]/g, '')
    // Remove special characters and extra whitespace, including em/en dashes,
    // tildes and slashes left dangling after an alternative was already split off
    // (e.g. "cornstarch — 1 tbsp", "chilli – 3 pcs", stray "/" from "garlic / X")
    .replace(/[&,;:~/–—]/g, '')
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

  // Compound pantry phrases checked FIRST — otherwise these get caught by a
  // protein keyword below just because they contain that word, e.g.
  // "fish sauce" contains "fish", "chicken stock" contains "chicken".
  const pantryPhraseKeywords = [
    'fish sauce',
    'oyster sauce',
    'soy sauce',
    'thai soy sauce',
    'thai oyster sauce',
    'shrimp paste',
    'dried shrimp',
    'dried scallop',
    'dried anchovy',
    'ikan bilis',
    'chicken stock',
    'chicken broth',
    'chicken powder',
    'chicken bouillon',
    'beef stock',
    'beef broth',
    'fish stock',
    'fish broth',
    'fish cake',
    'fish ball',
    'crab stick',
    'crab meat stick',
    'xo sauce',
    'egg noodle',
    'century egg',
  ];
  if (pantryPhraseKeywords.some((kw) => normalized.includes(kw))) return 'Pantry';

  // Protein keywords — includes specific fish/seafood species, not just the
  // generic "fish", so whole-fish recipes categorize correctly
  const proteinKeywords = [
    'chicken',
    'fish',
    'beef',
    'shrimp',
    'seafood',
    'tofu',
    'pork',
    'duck',
    'scallop',
    'crab',
    'salmon',
    'tuna',
    'cod',
    'halibut',
    'prawn',
    'egg',
    'seabass',
    'sea bass',
    'tilapia',
    'pomfret',
    'mackerel',
    'snapper',
    'grouper',
    'threadfin',
    'sole',
    'sea bream',
    'bream',
    'clam',
    'mussel',
    'squid',
    'otah',
    'ikan',
  ];
  if (proteinKeywords.some((kw) => normalized.includes(kw))) return 'Protein';

  // Vegetable keywords — expanded with the Singaporean/Chinese leafy-green
  // names and spelling variants actually used in the recipe library
  const vegKeywords = [
    'broccoli',
    'cauliflower',
    'cabbage',
    'kangkong',
    'bok choy',
    'pak choy',
    'kai lan',
    'kailan',
    'gai lan',
    'gailan',
    'nai bai',
    'caixin',
    'cai xin',
    'choy sum',
    'chye sim',
    'kim poh',
    'xiao bai cai',
    'carrot',
    'bell pepper',
    'capsicum',
    'snap pea',
    'mushroom',
    'pea',
    'bean',
    'beansprout',
    'bean sprout',
    'taugeh',
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
    'spring onion',
    'napa',
    'bamboo',
    'celery',
    'zucchini',
    'eggplant',
    'brinjal',
    'asparagus',
    'broccoli rabe',
    'kale',
    'arugula',
    'watercress',
    'corn',
    'sweet potato',
    'yam',
    'edamame',
    'avocado',
    'salad greens',
    'mixed greens',
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
    'chili',
    'lime',
    'lemon',
    'honey',
    'soy',
    'miso',
    'ponzu',
    'shallot',
    'milk',
    'cheese',
    'yogurt',
    'yoghurt',
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

  const addIngredientLine = (rawLine: string) => {
    // Split "X / Y" alternative lines (e.g. "Coffeemate / garlic powder",
    // "Broccoli/ cauliflower") into separate ingredients so they don't merge
    // into one nonsense item or leave a stray "/" behind.
    for (const piece of splitAlternatives(rawLine)) {
      const normalized = normalizeIngredient(piece);

      // Skip empty ingredients or very short strings (likely noise)
      if (!normalized || normalized.length < 2) continue;

      // Skip if in pantry staples
      if (activePantryNames.has(normalized)) continue;

      const category = categorizeIngredient(piece);
      const existing = ingredientMap.get(normalized) || { count: 0, category };
      ingredientMap.set(normalized, { count: existing.count + 1, category });
    }
  };

  for (const mealDay of plan.days) {
    // Add main recipe ingredients
    for (const ingredient of mealDay.main.ingredients) {
      addIngredientLine(ingredient);
    }

    // Add veg side ingredients if present
    if (mealDay.vegSide) {
      for (const ingredient of mealDay.vegSide.ingredients) {
        addIngredientLine(ingredient);
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
