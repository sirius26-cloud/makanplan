import type { Recipe } from './types';
import baseline from './baselineRecipes.json';

/**
 * The standard MakanPlan recipe library (63 recipes), from the master backup
 * exported on 2026-10-08. This is the baseline every device starts from.
 *
 * To change the baseline later: replace lib/baselineRecipes.json with a newer
 * "Export All Recipes" / master backup file.
 *
 * Baseline recipes are stamped with the export time, so on first sync they win
 * over older, never-edited copies on a device, while anything edited later
 * (which is stamped with its own, newer time) still wins over the baseline.
 */
export const BASELINE_TIME: number = Date.parse(baseline.exportDate);

export const USER_RECIPES: Recipe[] = (baseline.recipes as unknown as Recipe[]).map((r) => ({
  ...r,
  updatedAt: BASELINE_TIME,
}));
