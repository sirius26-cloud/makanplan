import { beforeEach, describe, expect, it, vi } from 'vitest';

const mem = new Map<string, string>();
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: async (k: string) => mem.get(k) ?? null,
    setItem: async (k: string, v: string) => { mem.set(k, v); },
  },
}));
vi.mock('react-native', () => ({ Platform: { OS: 'ios' } }));

import { mergeMaster, sanitizeIncoming, emptyMaster, type MasterData } from '../lib/recipeMerge';
import { syncRecipes } from '../lib/sync';
import { USER_RECIPES } from '../lib/userRecipes';
import { LEGACY_SEED_RECIPES } from '../lib/legacySeedRecipes';

let master: MasterData;
beforeEach(() => {
  mem.clear();
  mem.set('makanplan_sync_key', 'k');
  mem.set('makanplan_sync_base_url', 'https://example.test');
  master = emptyMaster();
  vi.stubGlobal('fetch', vi.fn(async (_url: string, init: any) => {
    if (init.method === 'POST') {
      master = { ...mergeMaster(master, sanitizeIncoming(JSON.parse(init.body))), updatedAt: Date.now() };
    }
    return new Response(JSON.stringify(master));
  }));
});

describe('first sync populates the 63-recipe baseline', () => {
  it('replaces stale copies, keeps real edits as copies and device-only recipes', async () => {
    const legacy = LEGACY_SEED_RECIPES.find((r) => USER_RECIPES.some((b) => b.id === r.id && b.name === r.name))!;
    const stale = { ...LEGACY_SEED_RECIPES[0] };                         // untouched old starter copy
    const realEdit = { ...USER_RECIPES[1], instructions: 'my own edit' }; // pre-update edit, no updatedAt
    delete (realEdit as any).updatedAt;
    const deviceOnly = { ...USER_RECIPES[2], id: 'mine_only', name: 'Only on this device', createdAt: 5 };
    delete (deviceOnly as any).updatedAt;

    const out = await syncRecipes([stale, realEdit, deviceOnly]);
    const ids = out.map((r) => r.id);

    expect(USER_RECIPES.every((b) => ids.includes(b.id))).toBe(true);       // all 63 present
    expect(ids).toContain('mine_only');                                      // device-only kept
    expect(out.find((r) => r.id === USER_RECIPES[1].id)!.instructions).toBe(USER_RECIPES[1].instructions); // baseline wins
    expect(out.some((r) => r.name === `${USER_RECIPES[1].name} (other device version)` && r.instructions === 'my own edit')).toBe(true);
    expect(out.filter((r) => r.name.endsWith('(other device version)'))).toHaveLength(1); // stale starter copy made no clutter
    expect(master.recipes.length).toBe(out.length);                          // master == device
    expect(legacy).toBeTruthy();
  });

  it('a fresh device (baseline seed) syncs with no copies', async () => {
    const out = await syncRecipes(USER_RECIPES);
    expect(out).toHaveLength(63);
  });
});
