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
 * Generate a weekly meal plan
 */
export function generateWeeklyPlan(
  recipes: Recipe[],
  peopleCount: number,
  numDays: number,
  proteinFilters?: ProteinType[],
  includeRiceDays: boolean = false,
): WeeklyPlan {
  // Filter recipes by proteins if specified
  const availableRecipes = proteinFilters && proteinFilters.length > 0
    ? recipes.filter((r) => proteinFilters.includes(r.protein))
    : recipes;

  // Separate by type
  const mains = availableRecipes.filter((r) => r.type === 'protein_main');
  const riceNoodleMains = availableRecipes.filter((r) => r.type === 'rice_noodle_one_pot');
  const vegSides = availableRecipes.filter((r) => r.type === 'veg_side');

  if (mains.length === 0) throw new Error('No protein mains available with selected filters');
  if (vegSides.length === 0) throw new Error('No veg sides available');

  const days: MealDay[] = [];
  const usedVegSides: Set<string> = new Set(); // Track used veg sides to rotate

  for (let day = 1; day <= numDays; day++) {
    let main: Recipe;

    // Decide if this should be a rice/noodle day
    const isRiceDay =
      includeRiceDays &&
      (numDays === 5 ? day === 3 : numDays === 6 ? day === 3 || day === 6 : day === 3 || day === 6);

    if (isRiceDay && riceNoodleMains.length > 0) {
      main = weightedRandomSelect(riceNoodleMains);
    } else {
      main = weightedRandomSelect(mains);
    }

    // Determine if we need a veg side
    // One-pot dishes (isRice) already include veg, so skip veg side for them
    let vegSide: Recipe | null = null;
    if (!main.hasVeg && !main.isRice) {
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
): MealDay {
  const availableRecipes = proteinFilters && proteinFilters.length > 0
    ? recipes.filter((r) => proteinFilters.includes(r.protein))
    : recipes;

  const mains = availableRecipes.filter((r) => r.type === 'protein_main');
  const riceNoodleMains = availableRecipes.filter((r) => r.type === 'rice_noodle_one_pot');
  const vegSides = availableRecipes.filter((r) => r.type === 'veg_side');

  if (mains.length === 0) throw new Error('No protein mains available with selected filters');

  // Avoid picking the same main as the current day
  const currentMain = currentPlan.days[dayIndex]?.main;
  const availableMains = mains.filter((m) => m.id !== currentMain?.id);
  const mainToUse = availableMains.length > 0 ? availableMains : mains;

  const isRiceDay =
    currentPlan.includeRiceDays &&
    (currentPlan.days.length === 5 ? dayIndex === 2 : currentPlan.days.length === 6 ? dayIndex === 2 || dayIndex === 5 : dayIndex === 2 || dayIndex === 5);

  const main =
    isRiceDay && riceNoodleMains.length > 0
      ? weightedRandomSelect(riceNoodleMains)
      : weightedRandomSelect(mainToUse);

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
  };
}
