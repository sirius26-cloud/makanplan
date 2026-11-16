/**
 * Pure merge logic for syncing the recipe library across devices.
 * Used by both the app and the /api/recipes serverless function, so it must
 * stay free of React Native / Node specific imports.
 *
 * Safety rules (so existing recipes are never disrupted):
 *  - Merging is a UNION by recipe id. A recipe missing from one side is never
 *    treated as deleted; only an explicit tombstone removes a recipe.
 *  - For the same id, the more recently edited copy wins (updatedAt, falling
 *    back to createdAt). On an exact tie the first argument wins.
 */
import type { Recipe } from './types';

export type Tombstones = Record<string, number>; // recipe id -> time deleted (ms)

export interface MasterData {
  version: 1;
  updatedAt: number;
  recipes: Recipe[];
  deleted: Tombstones;
}

export function emptyMaster(): MasterData {
  return { version: 1, updatedAt: 0, recipes: [], deleted: {} };
}

export function recipeStamp(r: Recipe): number {
  return r.updatedAt ?? r.createdAt ?? 0;
}

/** Remove device-only fields before a recipe is stored in the shared master. */
export function stripLocalFields(r: Recipe): Recipe {
  const { photo: _photo, ...rest } = r;
  return rest as Recipe;
}

export function mergeMaster(a: MasterData, b: MasterData): MasterData {
  const deleted: Tombstones = { ...a.deleted };
  for (const [id, ts] of Object.entries(b.deleted)) {
    deleted[id] = Math.max(deleted[id] ?? 0, ts);
  }

  const byId = new Map<string, Recipe>();
  for (const r of [...a.recipes, ...b.recipes]) {
    const existing = byId.get(r.id);
    // Strictly newer wins; ties keep whichever came first (a before b).
    if (!existing || recipeStamp(r) > recipeStamp(existing)) byId.set(r.id, r);
  }

  const recipes: Recipe[] = [];
  for (const r of byId.values()) {
    const deletedAt = deleted[r.id];
    if (deletedAt !== undefined && deletedAt >= recipeStamp(r)) continue;
    recipes.push(r);
  }

  return {
    version: 1,
    updatedAt: Math.max(a.updatedAt, b.updatedAt),
    recipes,
    deleted,
  };
}

/** Basic shape check for data arriving over the network. */
export function sanitizeIncoming(input: any): MasterData {
  const recipes: Recipe[] = Array.isArray(input?.recipes)
    ? input.recipes.filter(
        (r: any) =>
          r &&
          typeof r.id === 'string' &&
          typeof r.name === 'string' &&
          Array.isArray(r.ingredients) &&
          typeof r.instructions === 'string',
      )
    : [];
  const deleted: Tombstones = {};
  if (input?.deleted && typeof input.deleted === 'object') {
    for (const [id, ts] of Object.entries(input.deleted)) {
      if (typeof ts === 'number') deleted[id] = ts;
    }
  }
  return {
    version: 1,
    updatedAt: typeof input?.updatedAt === 'number' ? input.updatedAt : 0,
    recipes: recipes.map(stripLocalFields),
    deleted,
  };
}
