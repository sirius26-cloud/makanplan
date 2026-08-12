import { Recipe, MealDay, WeeklyPlan, ProteinType } from './types';

/**
 * Select a random item from an array, with higher weight for favourites/staples
 */
function weightedRandomSelect<T extends { isFavourite?: boolean; isStaple?: boolean }>(
  items: T[],
): T {
  if (items.length === 0) throw new Error('No items to select from');
  if (items.length === 1) return items[0];

  // Weight: staple = 3x, favourite = 2x, normal = 1x
  const weights = items.map((item) => {
    let weight = 1;
    if (item.isStaple) weight *= 3;
    if (item.isFavourite) weight *= 2;
    return weight;
  });

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) return items[i];
  }

  return items[items.length - 1];
}

/**
 * Decide the format independently each time a day is generated or reshuffled.
 * Rice/noodle days remain optional, but no calendar position is locked to a format.
 */
function chooseMealFormat(
  includeRiceDays: boolean,
  hasOnePotOptions: boolean,
): 'one-pot' | 'main-veg' {
  return includeRiceDays && hasOnePotOptions && Math.random() < 1 / 3
    ? 'one-pot'
    : 'main-veg';
}

/**
 * Generate a weekly meal plan
 */
export function generateWeeklyPlan(
  recipes: Recipe[],
  peopleCount: number,
  numDays: number,
  proteinFilters?: ProteinType[],
  includeRiceDays: boolean = false,
  dietaryRestrictionFilter?: (recipe: Recipe) => boolean,
  recentlyServedRecipeIds?: string[],
): WeeklyPlan {
  // Filter recipes by proteins if specified
  let availableRecipes = proteinFilters && proteinFilters.length > 0
    ? recipes.filter((r) => proteinFilters.includes(r.protein))
    : recipes;

  // Apply dietary restrictions filter
  if (dietaryRestrictionFilter) {
    availableRecipes = availableRecipes.filter(dietaryRestrictionFilter);
  }

  // Deprioritize recently served recipes
  if (recentlyServedRecipeIds && recentlyServedRecipeIds.length > 0) {
    const recentIds = new Set(recentlyServedRecipeIds);
    const recent = availableRecipes.filter((r) => recentIds.has(r.id));
    const notRecent = availableRecipes.filter((r) => !recentIds.has(r.id));
    availableRecipes = [...notRecent, ...recent];
  }

  // Separate by type
  const mains = availableRecipes.filter((r) => r.type === 'protein_main');
  const riceNoodleMains = availableRecipes.filter((r) => r.type === 'rice_noodle_one_pot');
  const vegSides = availableRecipes.filter((r) => r.type === 'veg_side');

  if (mains.length === 0) throw new Error('No protein mains available with selected filters');
  if (vegSides.length === 0) throw new Error('No veg sides available');

  const days: MealDay[] = [];
  const usedVegSides: Set<string> = new Set(); // Track used veg sides to rotate

  for (let day = 1; day <= numDays; day++) {
    const format = chooseMealFormat(includeRiceDays, riceNoodleMains.length > 0);
    const main = weightedRandomSelect(
      format === 'one-pot' ? riceNoodleMains : mains,
    );

    // Determine if we need a veg side
    let vegSide: Recipe | null = null;
    if (!main.hasVeg) {
      // Pick a veg side, rotating through the pool
      const availableVegSides = vegSides.filter((v) => !usedVegSides.has(v.id));

      if (availableVegSides.length === 0) {
        // Reset pool if we've used all
        usedVegSides.clear();
      }

      const selected = weightedRandomSelect(availableVegSides.length > 0 ? availableVegSides : vegSides);
      vegSide = selected;
      usedVegSides.add(selected.id);

      // Reset pool if we've used more than half
      if (usedVegSides.size > Math.ceil(vegSides.length / 2)) {
        usedVegSides.clear();
      }
    }

    days.push({
      day,
      main,
      vegSide,
      format,
    });
  }

  return {
    id: `plan_${Date.now()}`,
    createdAt: Date.now(),
    peopleCount,
    days,
    proteinFilters,
    includeRiceDays,
  };
}

/**
 * Regenerate a single day's meals
 */
export function regenerateMealDay(
  recipes: Recipe[],
  currentPlan: WeeklyPlan,
  dayIndex: number,
  proteinFilters?: ProteinType[],
  dietaryRestrictionFilter?: (recipe: Recipe) => boolean,
  recentlyServedRecipeIds?: string[],
): MealDay {
  let availableRecipes = proteinFilters && proteinFilters.length > 0
    ? recipes.filter((r) => proteinFilters.includes(r.protein))
    : recipes;

  // Apply dietary restrictions filter
  if (dietaryRestrictionFilter) {
    availableRecipes = availableRecipes.filter(dietaryRestrictionFilter);
  }

  // Deprioritize recently served recipes
  if (recentlyServedRecipeIds && recentlyServedRecipeIds.length > 0) {
    const recentIds = new Set(recentlyServedRecipeIds);
    const recent = availableRecipes.filter((r) => recentIds.has(r.id));
    const notRecent = availableRecipes.filter((r) => !recentIds.has(r.id));
    availableRecipes = [...notRecent, ...recent];
  }

  const mains = availableRecipes.filter((r) => r.type === 'protein_main');
  const riceNoodleMains = availableRecipes.filter((r) => r.type === 'rice_noodle_one_pot');
  const vegSides = availableRecipes.filter((r) => r.type === 'veg_side');

  if (mains.length === 0) throw new Error('No protein mains available with selected filters');

  // Avoid picking the same main as the current day
  const currentMain = currentPlan.days[dayIndex]?.main;
  const availableMains = mains.filter((m) => m.id !== currentMain?.id);
  const mainToUse = availableMains.length > 0 ? availableMains : mains;
  const availableOnePots = riceNoodleMains.filter((main) => main.id !== currentMain?.id);
  const onePotToUse = availableOnePots.length > 0 ? availableOnePots : riceNoodleMains;
  const format = chooseMealFormat(currentPlan.includeRiceDays, onePotToUse.length > 0);
  const main = weightedRandomSelect(format === 'one-pot' ? onePotToUse : mainToUse);

  let vegSide: Recipe | null = null;
  if (!main.hasVeg && vegSides.length > 0) {
    const currentVegSide = currentPlan.days[dayIndex]?.vegSide;
    const availableVegSides = vegSides.filter((v) => v.id !== currentVegSide?.id);
    const vegToUse = availableVegSides.length > 0 ? availableVegSides : vegSides;
    vegSide = weightedRandomSelect(vegToUse);
  }

  return {
    day: dayIndex + 1,
    main,
    vegSide,
    format,
  };
}


/**
 * Generate a meal day with explicit format control (one-pot or main+veg)
 */
export async function generateMealDayWithFormat(
  recipes: Recipe[],
  currentPlan: WeeklyPlan,
  dayIndex: number,
  format: 'one-pot' | 'main-veg',
  proteinFilters?: ProteinType[],
): Promise<MealDay> {
  const vegSides = recipes.filter((r) => r.type === 'veg_side');
  const riceNoodleMains = recipes.filter((r) => r.type === 'rice_noodle_one_pot');
  const proteinMains = recipes.filter(
    (r) =>
      r.type === 'protein_main' &&
      (!proteinFilters || proteinFilters.length === 0 || proteinFilters.includes(r.protein)),
  );

  let main: Recipe;
  let vegSide: Recipe | null = null;

  if (format === 'one-pot') {
    // Pick a one-pot main
    if (riceNoodleMains.length === 0) {
      throw new Error('No one-pot dishes available');
    }
    main = weightedRandomSelect(riceNoodleMains);
  } else {
    // Pick a protein main + veg side
    if (proteinMains.length === 0) {
      throw new Error('No protein mains available');
    }
    main = weightedRandomSelect(proteinMains);

    // Pick a veg side if needed
    if (!main.hasVeg && vegSides.length > 0) {
      const currentVegSide = currentPlan.days[dayIndex]?.vegSide;
      const availableVegSides = vegSides.filter((v) => v.id !== currentVegSide?.id);
      const vegToUse = availableVegSides.length > 0 ? availableVegSides : vegSides;
      vegSide = weightedRandomSelect(vegToUse);
    }
  }

  return {
    day: dayIndex + 1,
    main,
    vegSide,
    format,
  };
}
