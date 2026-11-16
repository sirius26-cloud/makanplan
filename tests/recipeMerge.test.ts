import { describe, expect, it } from 'vitest';
import { emptyMaster, mergeMaster, sanitizeIncoming, stripLocalFields } from '../lib/recipeMerge';
import type { Recipe } from '../lib/types';

const base = (id: string, extra: Partial<Recipe> = {}): Recipe => ({
  id, name: id, type: 'protein_main', protein: 'fish', hasVeg: false, isRice: false,
  isFavourite: false, isStaple: false, ingredients: ['a'], instructions: 'b', servings: 2,
  cuisineType: 'Mixed', spiceLevel: 'light', createdAt: 1000, ...extra,
});
const m = (recipes: Recipe[], deleted = {}) => ({ ...emptyMaster(), recipes, deleted });

describe('mergeMaster', () => {
  it('keeps recipes that exist on only one side (never deletes by omission)', () => {
    const out = mergeMaster(m([base('a')]), m([base('b')]));
    expect(out.recipes.map((r) => r.id).sort()).toEqual(['a', 'b']);
  });
  it('newer edit wins; tie keeps first argument', () => {
    const newer = base('a', { name: 'new', updatedAt: 3000 });
    const older = base('a', { name: 'old', updatedAt: 2000 });
    expect(mergeMaster(m([older]), m([newer])).recipes[0].name).toBe('new');
    expect(mergeMaster(m([newer]), m([older])).recipes[0].name).toBe('new');
    const t1 = base('a', { name: 'first' }), t2 = base('a', { name: 'second' });
    expect(mergeMaster(m([t1]), m([t2])).recipes[0].name).toBe('first');
  });
  it('explicit deletion removes a recipe on every device', () => {
    const out = mergeMaster(m([base('a'), base('b')]), m([], { a: 5000 }));
    expect(out.recipes.map((r) => r.id)).toEqual(['b']);
  });
  it('a recipe edited after its deletion comes back', () => {
    const out = mergeMaster(m([base('a', { updatedAt: 9000 })]), m([], { a: 5000 }));
    expect(out.recipes).toHaveLength(1);
  });
});

describe('sanitizeIncoming / stripLocalFields', () => {
  it('drops malformed recipes and device-only photos', () => {
    const photo = { localUri: 'file://x', mimeType: 'image/jpeg', savedAt: 1 };
    const out = sanitizeIncoming({ recipes: [base('a', { photo }), { id: 'bad' }, null], deleted: { x: 1, y: 'no' } });
    expect(out.recipes).toHaveLength(1);
    expect(out.recipes[0].photo).toBeUndefined();
    expect(out.deleted).toEqual({ x: 1 });
    expect(stripLocalFields(base('a', { photo })).photo).toBeUndefined();
  });
});
