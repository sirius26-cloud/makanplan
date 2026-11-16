import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { USER_RECIPES } from './userRecipes';
import {
  emptyMaster,
  findTieConflictCopies,
  mergeMaster,
  sanitizeIncoming,
  stripLocalFields,
  type MasterData,
  type Tombstones,
} from './recipeMerge';
import type { Recipe } from './types';

const KEY_STORAGE = 'makanplan_sync_key';
const BASE_STORAGE = 'makanplan_sync_base_url';
const TOMBSTONES_STORAGE = 'makanplan_tombstones';
const LAST_SYNC_STORAGE = 'makanplan_last_sync';

export async function getSyncKey(): Promise<string> {
  return (await AsyncStorage.getItem(KEY_STORAGE)) ?? '';
}
export async function setSyncKey(key: string): Promise<void> {
  await AsyncStorage.setItem(KEY_STORAGE, key.trim());
}
export async function getSyncBaseUrl(): Promise<string> {
  if (Platform.OS === 'web' && typeof window !== 'undefined') return window.location.origin;
  const stored = (await AsyncStorage.getItem(BASE_STORAGE)) ?? '';
  return (stored || process.env.EXPO_PUBLIC_SYNC_BASE_URL || '').replace(/\/+$/, '');
}
export async function setSyncBaseUrl(url: string): Promise<void> {
  await AsyncStorage.setItem(BASE_STORAGE, url.trim().replace(/\/+$/, ''));
}
export async function getLastSync(): Promise<number | null> {
  const v = await AsyncStorage.getItem(LAST_SYNC_STORAGE);
  return v ? Number(v) : null;
}

export async function isSyncConfigured(): Promise<boolean> {
  return !!(await getSyncKey()) && !!(await getSyncBaseUrl());
}

async function loadTombstones(): Promise<Tombstones> {
  try {
    const raw = await AsyncStorage.getItem(TOMBSTONES_STORAGE);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Remember that a recipe was deleted on this device so other devices drop it too. */
export async function recordDeletions(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const t = await loadTombstones();
  const now = Date.now();
  for (const id of ids) t[id] = now;
  await AsyncStorage.setItem(TOMBSTONES_STORAGE, JSON.stringify(t));
}

async function request(path: string, init: { method: 'GET' | 'POST'; body?: unknown }) {
  const [key, base] = await Promise.all([getSyncKey(), getSyncBaseUrl()]);
  if (!key) throw new Error('Enter your sync passcode in Settings first.');
  if (!base) throw new Error('Enter the MakanPlan web address in Settings first.');
  const response = await fetch(`${base}${path}`, {
    method: init.method,
    headers: { 'content-type': 'application/json', 'x-sync-key': key },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  let data: any = null;
  try {
    data = await response.json();
  } catch {}
  if (!response.ok) throw new Error(data?.error || `Request failed (${response.status})`);
  return data;
}

/**
 * Merge this device's recipes with the master and return the result.
 * Local photos (stored only on this device) are always kept.
 */
export async function syncRecipes(localIn: Recipe[]): Promise<Recipe[]> {
  const tombstones = await loadTombstones();

  // Look at the master first so differing old versions are kept, not overwritten.
  const current = sanitizeIncoming(await request('/api/recipes', { method: 'GET' }));
  const copies = findTieConflictCopies(localIn, current.recipes, USER_RECIPES);
  const local = [...localIn, ...copies];

  const payload: MasterData = {
    version: 1,
    updatedAt: Date.now(),
    recipes: local.map(stripLocalFields),
    deleted: tombstones,
  };
  const remote = sanitizeIncoming(await request('/api/recipes', { method: 'POST', body: payload }));

  // Master first: on an exact tie the shared version wins, so all devices converge.
  const localMaster: MasterData = { ...emptyMaster(), recipes: local, deleted: tombstones };
  const merged = mergeMaster(remote, localMaster);

  const localPhotos = new Map(local.filter((r) => r.photo).map((r) => [r.id, r.photo!]));
  const recipes = merged.recipes.map((r) =>
    localPhotos.has(r.id) && !r.photo ? { ...r, photo: localPhotos.get(r.id) } : r,
  );

  await AsyncStorage.setItem(TOMBSTONES_STORAGE, JSON.stringify(merged.deleted));
  await AsyncStorage.setItem(LAST_SYNC_STORAGE, String(Date.now()));
  return recipes;
}

/** Download the master library (used for the "Download master backup" button). */
export async function fetchMasterRecipes(): Promise<Recipe[]> {
  const data = sanitizeIncoming(await request('/api/recipes', { method: 'GET' }));
  return data.recipes;
}

export interface AIParsedRecipe {
  name: string;
  type: Recipe['type'];
  protein: Recipe['protein'];
  hasVeg: boolean;
  isRice: boolean;
  cuisineType: Recipe['cuisineType'];
  spiceLevel: Recipe['spiceLevel'];
  servings: number;
  ingredients: string[];
  instructions: string;
  courseType?: 'dessert' | 'sauce';
  reviewNotes: string[];
}

export async function parseRecipeWithAI(text: string): Promise<AIParsedRecipe> {
  return request('/api/parse-recipe', { method: 'POST', body: { text } });
}
