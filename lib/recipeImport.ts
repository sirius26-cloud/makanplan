import { Recipe, RecipeType, ProteinType } from './types';

export interface ParsedRecipe {
  name?: string;
  ingredients?: string[];
  instructions?: string;
  servings?: number;
  cuisineType?: string;
  protein?: ProteinType;
  type?: RecipeType;
  spiceLevel?: string;
}

// Common recipe websites
const RECIPE_SITES: Record<string, string> = {
  'allrecipes.com': 'AllRecipes',
  'foodnetwork.com': 'Food Network',
  'epicurious.com': 'Epicurious',
  'seriouseats.com': 'Serious Eats',
  'bonappetit.com': 'Bon Appétit',
  'saveur.com': 'Saveur',
  'chefsteps.com': 'ChefSteps',
  'sbs.com.au': 'SBS Food',
  'taste.com.au': 'Taste',
  'recipetin.com': 'RecipeTin Eats',
};

// Protein keywords
const PROTEIN_KEYWORDS: Record<ProteinType, string[]> = {
  chicken: ['chicken', 'poultry', 'fowl'],
  fish: ['fish', 'salmon', 'cod', 'snapper', 'barramundi', 'trout'],
  beef: ['beef', 'steak', 'brisket', 'chuck', 'rib'],
  seafood: ['seafood', 'shrimp', 'prawn', 'squid', 'crab', 'lobster', 'scallop', 'clam'],
  tofu: ['tofu', 'bean curd', 'tempeh'],
};

// Cuisine keywords
const CUISINE_KEYWORDS: Record<string, string[]> = {
  Japanese: ['japanese', 'sushi', 'ramen', 'teriyaki', 'miso', 'sake'],
  Thai: ['thai', 'pad thai', 'tom yum', 'curry', 'lemongrass'],
  Cantonese: ['cantonese', 'dim sum', 'wok', 'soy sauce', 'oyster sauce'],
  Vietnamese: ['vietnamese', 'pho', 'banh mi', 'nuoc mam', 'fish sauce'],
  Western: ['western', 'italian', 'french', 'american', 'european'],
};

/**
 * Parse recipe from raw text (handwritten OCR or pasted text)
 */
export function parseRecipeText(text: string): ParsedRecipe {
  const lines = text.split('\n').filter((line) => line.trim());
  const parsed: ParsedRecipe = {
    ingredients: [],
  };

  let section = 'unknown'; // unknown, name, ingredients, instructions
  let currentIngredients: string[] = [];
  let currentInstructions: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const lower = trimmed.toLowerCase();

    // Detect section headers
    if (
      lower.includes('ingredient') ||
      lower.includes('what you need') ||
      lower.includes('supplies')
    ) {
      section = 'ingredients';
      continue;
    }
    if (
      lower.includes('instruction') ||
      lower.includes('method') ||
      lower.includes('direction') ||
      lower.includes('step') ||
      lower.includes('procedure')
    ) {
      section = 'instructions';
      continue;
    }
    if (lower.includes('serving') && lower.includes('pax')) {
      const match = trimmed.match(/(\d+)\s*pax/i);
      if (match) parsed.servings = parseInt(match[1]);
      continue;
    }

    // Parse content based on section
    if (section === 'ingredients' && trimmed) {
      currentIngredients.push(trimmed);
    } else if (section === 'instructions' && trimmed) {
      currentInstructions.push(trimmed);
    } else if (section === 'unknown' && !parsed.name && trimmed.length > 3) {
      // First non-empty line is likely the recipe name
      parsed.name = trimmed;
      section = 'name_done';
    }
  }

  parsed.ingredients = currentIngredients;
  if (currentInstructions.length > 0) {
    parsed.instructions = currentInstructions.join(' ');
  }

  // Detect protein
  const textLower = text.toLowerCase();
  for (const [protein, keywords] of Object.entries(PROTEIN_KEYWORDS)) {
    if (keywords.some((kw) => textLower.includes(kw))) {
      parsed.protein = protein as ProteinType;
      break;
    }
  }

  // Detect cuisine
  for (const [cuisine, keywords] of Object.entries(CUISINE_KEYWORDS)) {
    if (keywords.some((kw) => textLower.includes(kw))) {
      parsed.cuisineType = cuisine;
      break;
    }
  }

  // Detect spice level
  if (textLower.includes('spicy') || textLower.includes('chili') || textLower.includes('hot')) {
    parsed.spiceLevel = 'medium';
  } else if (
    textLower.includes('mild') ||
    textLower.includes('light') ||
    textLower.includes('subtle')
  ) {
    parsed.spiceLevel = 'light';
  }

  // Default values
  if (!parsed.servings) parsed.servings = 4;
  if (!parsed.cuisineType) parsed.cuisineType = 'Mixed';
  if (!parsed.spiceLevel) parsed.spiceLevel = 'light';
  if (!parsed.protein) parsed.protein = 'chicken';
  if (!parsed.type) parsed.type = 'protein_main';

  return parsed;
}

/**
 * Extract recipe from URL using basic HTML parsing
 * Note: This is a simplified approach that works for common recipe sites
 */
export async function parseRecipeFromUrl(url: string): Promise<ParsedRecipe> {
  try {
    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      },
    });

    if (!response.ok) throw new Error('Failed to fetch URL');

    const html = await response.text();
    const parsed: ParsedRecipe = {
      ingredients: [],
    };

    // Extract recipe name (common patterns)
    let nameMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (!nameMatch) nameMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (nameMatch) {
      parsed.name = nameMatch[1]
        .replace(/\s*recipe\s*/i, '')
        .replace(/\s*\|.*$/, '')
        .trim();
    }

    // Extract ingredients (common patterns)
    const ingredientPatterns = [
      /<li[^>]*class="[^"]*ingredient[^"]*"[^>]*>([^<]+)<\/li>/gi,
      /<li[^>]*>([^<]*(?:cup|tbsp|tsp|g|kg|oz|lb|ml|l)[^<]*)<\/li>/gi,
      /<div[^>]*class="[^"]*ingredient[^"]*"[^>]*>([^<]+)<\/div>/gi,
    ];

    for (const pattern of ingredientPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const ingredient = match[1]
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .trim();
        if (ingredient.length > 3 && ingredient.length < 200) {
          parsed.ingredients!.push(ingredient);
        }
      }
      if (parsed.ingredients!.length > 0) break;
    }

    // Extract instructions (common patterns)
    const instructionPatterns = [
      /<li[^>]*class="[^"]*instruction[^"]*"[^>]*>([^<]+)<\/li>/gi,
      /<div[^>]*class="[^"]*instruction[^"]*"[^>]*>([^<]+)<\/div>/gi,
      /<p[^>]*class="[^"]*step[^"]*"[^>]*>([^<]+)<\/p>/gi,
    ];

    const instructions: string[] = [];
    for (const pattern of instructionPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const instruction = match[1]
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .trim();
        if (instruction.length > 5 && instruction.length < 500) {
          instructions.push(instruction);
        }
      }
      if (instructions.length > 0) break;
    }

    if (instructions.length > 0) {
      parsed.instructions = instructions.join(' ');
    }

    // Extract servings
    const servingsMatch = html.match(/(?:servings?|serves?|yield)[\s:]*(\d+)/i);
    if (servingsMatch) {
      parsed.servings = parseInt(servingsMatch[1]);
    }

    // Detect protein and cuisine from URL and content
    const urlContent = url + ' ' + html.toLowerCase();
    for (const [protein, keywords] of Object.entries(PROTEIN_KEYWORDS)) {
      if (keywords.some((kw) => urlContent.includes(kw))) {
        parsed.protein = protein as ProteinType;
        break;
      }
    }

    for (const [cuisine, keywords] of Object.entries(CUISINE_KEYWORDS)) {
      if (keywords.some((kw) => urlContent.includes(kw))) {
        parsed.cuisineType = cuisine;
        break;
      }
    }

    // Set defaults
    if (!parsed.servings) parsed.servings = 4;
    if (!parsed.cuisineType) parsed.cuisineType = 'Mixed';
    if (!parsed.spiceLevel) parsed.spiceLevel = 'light';
    if (!parsed.protein) parsed.protein = 'chicken';
    if (!parsed.type) parsed.type = 'protein_main';
    if (!parsed.ingredients || parsed.ingredients.length === 0) {
      parsed.ingredients = ['See original recipe for ingredients'];
    }
    if (!parsed.instructions) {
      parsed.instructions = 'See original recipe for instructions';
    }

    return parsed;
  } catch (error) {
    console.error('Failed to parse recipe from URL:', error);
    return {
      name: 'Recipe from URL',
      ingredients: ['See original recipe for ingredients'],
      instructions: 'See original recipe for instructions',
      servings: 4,
      cuisineType: 'Mixed',
      spiceLevel: 'light',
      protein: 'chicken',
      type: 'protein_main',
    };
  }
}

/**
 * Format parsed recipe for display
 */
export function formatParsedRecipe(parsed: ParsedRecipe): string {
  const lines = [];
  if (parsed.name) lines.push(`Name: ${parsed.name}`);
  if (parsed.protein) lines.push(`Protein: ${parsed.protein}`);
  if (parsed.cuisineType) lines.push(`Cuisine: ${parsed.cuisineType}`);
  if (parsed.servings) lines.push(`Servings: ${parsed.servings} pax`);
  if (parsed.ingredients && parsed.ingredients.length > 0) {
    lines.push(`\nIngredients (${parsed.ingredients.length}):`);
    parsed.ingredients.forEach((ing) => lines.push(`  • ${ing}`));
  }
  if (parsed.instructions) {
    lines.push(`\nInstructions:\n${parsed.instructions}`);
  }
  return lines.join('\n');
}
